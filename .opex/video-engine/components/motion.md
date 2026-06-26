# MOTION COMPONENTS

Last updated: 2025-01-25
Version: 1

## SPRING ANIMATIONS

Standard spring config:
  damping: 10
  mass: 0.5
  stiffness: 100

Bouncy spring:
  damping: 8
  mass: 0.3
  stiffness: 150

Smooth spring:
  damping: 15
  mass: 0.8
  stiffness: 80

## EASING PRESETS

Ease out: [0, 0, 0.58, 1]
Ease in: [0.42, 0, 1, 1]
Ease in-out: [0.42, 0, 0.58, 1]
Sharp ease out: [0.19, 1, 0.22, 1]

## COMMON ANIMATIONS

Text slide up:
  from: { y: 50, opacity: 0 }
  to: { y: 0, opacity: 1 }
  spring: standard

Text fade in:
  from: { opacity: 0 }
  to: { opacity: 1 }
  duration: 300ms

Scale bounce:
  from: { scale: 0.8, opacity: 0 }
  to: { scale: 1, opacity: 1 }
  spring: bouncy

Slide from right:
  from: { x: 100, opacity: 0 }
  to: { x: 0, opacity: 1 }
  spring: standard

## STAGGERED ANIMATIONS

For lists or multiple elements:
  staggerChildren: 0.1 (100ms between each)
  delayChildren: 0.2 (200ms before first)
