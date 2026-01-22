import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Custom hook for creating a continuous pulsing animation
 * @param isActive - Whether the animation should be running
 * @param duration - Duration of one pulse cycle in milliseconds (default: 1500)
 * @returns Animated.Value that oscillates between 0.6 and 1
 */
export function usePulseAnimation(
  isActive: boolean,
  duration: number = 1500
): Animated.Value {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive) {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      animationRef.current.start();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      pulseAnim.setValue(1);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isActive, duration, pulseAnim]);

  return pulseAnim;
}
