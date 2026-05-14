import { Text } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import * as si from 'simple-icons';

interface Props {
  iconSlug: string;
  size?: number;
  color?: string;
  fallback?: string;
}

export default function ServiceLogo({ iconSlug, size = 32, color = '#fff', fallback }: Props) {
  const key = ('si' + iconSlug.charAt(0).toUpperCase() + iconSlug.slice(1)) as keyof typeof si;
  const icon = si[key] as { path: string } | undefined;

  if (!icon) {
    if (fallback) {
      return (
        <Text style={{ color, fontSize: size * 0.65, fontWeight: '700' }}>
          {fallback}
        </Text>
      );
    }
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={icon.path} />
    </Svg>
  );
}
