---
name: advanced-web-motion
description: Advanced 60fps web motion choreography: 3D point-cloud morphing with vortex interpolation, spring-damped 3D card tilt with specular glare tracking, elastic string physics, and scroll-triggered staggered 3D reveals.
---

# Advanced Web Motion & Choreography Skill

Use this skill to engineer fluid, tactile, 60fps motion systems in web applications without heavy external dependencies.

## 1. 3D Point-Cloud Morphing (Vortex Spring Interpolation)
- Normalize all 3D target geometries to a fixed point count $N$.
- During shape transitions ($u \in [0, 1]$), apply an exponential spring-out curve $s = 1 - (1 - u)^3$ combined with a mid-transition azimuthal vortex twist $\theta_{\text{twist}} = \sin(u \pi) \cdot 1.6$ so particles swirl organically through 3D space from shape A to shape B instead of popping abruptly.

## 2. Spring-Damped 3D Card Tilt & Specular Light Tracking
- Track normalized pointer position $(px, py) \in [-0.5, 0.5]$ inside interactive cards.
- Interpolate `rotateX`, `rotateY`, and `scale3d` using frame-rate-independent lerp (`current += (target - current) * 0.14`) and update `--glare-x` / `--glare-y` CSS custom properties for realistic surface reflection.

## 3. Scroll-Driven Staggered 3D Entrance Choreography
- Observe elements with `IntersectionObserver` (`threshold: 0.12`).
- Transition from `opacity: 0; transform: translate3d(0, 42px, -40px) scale(0.96)` to `opacity: 1; transform: translate3d(0, 0, 0) scale(1)` using `cubic-bezier(0.16, 1, 0.3, 1)` and staggered `--stagger-delay` per item.

## 4. Elastic Web String Physics (Verlet / Spring Midpoint)
- Model connecting silk threads as a quadratic Bezier curve whose control point $(cx, cy)$ behaves as a damped harmonic oscillator (`vy += (targetY - cy) * stiffness; vy *= damping; cy += vy`), plucking smoothly when the cursor passes through or clicks.
