import os
import sys
import time
import numpy as np

# @jin_22ee • 2026 — "WILL YOU" (3D ASCII Diamond Ring)
PI, TAU = np.pi, 2.0 * np.pi
BAND, PRONG, GEM = 0, 1, 2

R_BAND, r_BAND = 1.00, 0.14
CULET_Y, GIRDLE_Y, TABLE_Y = 1.06, 1.48, 1.66
GIRDLE_R, TABLE_R = 0.46, 0.28

DRAW = (0.0, 5.6)
TURN = 12.0
FPS = 30
CHARS = " .,:;+i1tfLCG08@"
PHRASE = "WILLYOUMARRYME"


def build_ring():
    """construct 3d point cloud (P), surface normals (N), and part tags (F)"""
    P, N, F = [], [], []

    def facet(tri, n, tag=GEM, step=0.024):
        a, b, c = tri
        n = np.asarray(n, dtype=float)
        n /= np.linalg.norm(n) or 1.0
        steps = max(int(max(np.linalg.norm(b - a), np.linalg.norm(c - a)) / step), 4)
        pts = [
            a + u * (b - a) + v * (c - a)
            for u in np.linspace(0.0, 1.0, steps)
            for v in np.linspace(0.0, 1.0 - u, max(int(steps * (1.0 - u)), 1))
        ]
        P.append(np.array(pts))
        N.append(np.tile(n, (len(pts), 1)))
        F.append(np.full(len(pts), tag, dtype=int))

    u = np.linspace(0, TAU, 180, endpoint=False)
    v = np.linspace(0, TAU, 28, endpoint=False)
    U, V = np.meshgrid(u, v, indexing="ij")
    U, V = U.ravel(), V.ravel()
    rt = r_BAND * (1.0 - 0.18 * np.clip(np.sin(U), 0, 1) ** 2)
    P.append(np.stack([(R_BAND + rt * np.cos(V)) * np.cos(U), (R_BAND + rt * np.cos(V)) * np.sin(U), rt * np.sin(V)], axis=-1))
    N.append(np.stack([np.cos(V) * np.cos(U), np.cos(V) * np.sin(U), np.sin(V)], axis=-1))
    F.append(np.full(len(U), BAND, dtype=int))

    k = 0
    for a in np.linspace(0, TAU, 6, endpoint=False) + PI / 6:
        for s in np.linspace(0.0, 1.0, 24):
            y = R_BAND + s * (GIRDLE_Y + 0.03 - R_BAND)
            r = 0.14 + s * (GIRDLE_R * 1.03 - 0.14)
            P.append(np.array([[r * np.cos(a), y, r * np.sin(a)]]))
            N.append(np.array([[np.cos(a), 0.25, np.sin(a)]]))
            F.append(np.array([PRONG]))
            k += 1

    m = 16
    for i in range(m):
        a0, a1 = TAU * i / m, TAU * (i + 1) / m
        g0 = np.array([GIRDLE_R * np.cos(a0), GIRDLE_Y, GIRDLE_R * np.sin(a0)])
        g1 = np.array([GIRDLE_R * np.cos(a1), GIRDLE_Y, GIRDLE_R * np.sin(a1)])
        t0 = np.array([TABLE_R * np.cos(a0), TABLE_Y, TABLE_R * np.sin(a0)])
        t1 = np.array([TABLE_R * np.cos(a1), TABLE_Y, TABLE_R * np.sin(a1)])
        culet = np.array([0, CULET_Y, 0])
        crown = np.cross(g1 - g0, t0 - g0)
        crown *= np.sign(crown[1]) or 1
        facet((g0, g1, t0), crown)
        facet((g1, t1, t0), crown * [1, 1.15, 1])
        pav = np.cross(culet - g0, g1 - g0)
        pav *= -np.sign(pav[1]) or 1
        facet((g0, g1, culet), pav)
        facet((np.array([0, TABLE_Y, 0]), t0, t1), np.array([0, 1.0, 0]))
    return np.concatenate(P), np.concatenate(N), np.concatenate(F)


RING_P, RING_N, RING_F = build_ring()


def butterfly_rays(n_pts=900):
    """caustic dispersion wings behind the diamond when spinning"""
    th = np.linspace(0, TAU, n_pts, endpoint=False)
    r = 1.45 * np.abs(np.sin(2 * th)) ** 0.75 * (0.65 + 0.35 * np.cos(th) ** 2)
    x = r * np.cos(th) * 1.25
    y = 0.25 + r * np.sin(th) * 0.85
    z = np.full_like(x, -0.35)
    return np.stack([x, y, z], axis=-1)


WING_P = butterfly_rays()


def project(p, w=120, h=60, fov=2.8, cam_z=3.6):
    """perspective projection from 3D world space into terminal grid"""
    z = cam_z - p[:, 2]
    scale = fov / np.clip(z, 0.2, None)
    sx = (w * 0.5 + p[:, 0] * scale * (h * 0.72)).astype(int)
    sy = (h * 0.54 - (p[:, 1] - 0.22) * scale * (h * 0.38)).astype(int)
    return sx, sy, z


def lights(t):
    """orbiting key light and cool rim backlight for diamond fire"""
    a = t * 0.45
    key = np.array([0.62 * np.cos(a), 0.78, 0.65 + 0.22 * np.sin(a)])
    rim = np.array([-0.58, -0.32, -0.74])
    return key / np.linalg.norm(key), rim / np.linalg.norm(rim)


def spin(t):
    return TAU * max(t - DRAW[1] - 0.6, 0) / TURN                   # start spinning after draw


def rot_y(p, a):
    c, s = np.cos(a), np.sin(a)
    return np.stack([c * p[:, 0] + s * p[:, 2], p[:, 1], -s * p[:, 0] + c * p[:, 2]], axis=-1)


def draw_order():
    """when each point appears: the band draws itself from the bottom
    then the prongs rise, then the diamond fills in from its tip"""
    p = RING_P
    up_band = np.abs(np.angle(np.exp(1j * (np.arctan2(p[:, 1], p[:, 0]) + PI / 2)))) / PI
    prong = 1.0 + (p[:, 1] - R_BAND) / (TABLE_Y - R_BAND) * 0.25
    gem = 1.25 + (p[:, 1] - CULET_Y) / (TABLE_Y - CULET_Y) * 0.45
    return np.where(RING_F == BAND, up_band, np.where(RING_F == PRONG, prong, gem))


ORDER = draw_order()


def render_frame(t, w=120, h=56):
    prog = (t - DRAW[0]) / (DRAW[1] - DRAW[0]) * 1.70
    mask = ORDER <= prog
    ang = spin(t)
    p = rot_y(RING_P[mask], ang)
    n = rot_y(RING_N[mask], ang)
    key, rim = lights(t)
    diff = np.clip(n @ key, 0, 1)
    spec = np.clip(n @ ((key + [0, 0, 1]) / np.linalg.norm(key + [0, 0, 1])), 0, 1) ** 18
    lum = np.clip(0.18 + 0.68 * diff + 0.35 * np.clip(n @ rim, 0, 1) + 1.25 * spec, 0, 1)
    return p, lum, np.degrees(ang) % 360.0, int(np.sum(spec > 0.25)), len(p)
