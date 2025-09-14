import {StyleSheet} from 'react-native';
import {FontSize} from '../theme/font-size';
import {scale} from '../theme/scale';
import {typography} from '../theme/typography';

export const createStyle = () =>
  StyleSheet.create({
    tabContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      width: scale(100),
    },
    textStyle: {
      fontSize: FontSize.FONT_12Px,
      fontFamily: typography.medium,
    },
  });
