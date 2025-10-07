/**
 * Configuração global de estilos e fontes
 * Este arquivo deve ser importado no _layout.tsx principal
 */

import { Text, TextInput } from 'react-native';
import { Fonts } from './theme';

/**
 * Aplica a fonte Montserrat como padrão em todos os componentes Text e TextInput
 */
export const applyGlobalFontStyles = () => {
  // Configurar fonte padrão para Text
  const TextRender = Text.render;
  const initialDefaultProps = Text.defaultProps;
  Text.defaultProps = {
    ...initialDefaultProps,
    style: [{ fontFamily: Fonts.regular }, initialDefaultProps?.style],
  };
  Text.render = function render(props: any) {
    const oldProps = props;
    props = {
      ...props,
      style: [{ fontFamily: Fonts.regular }, props.style],
    };
    try {
      return TextRender.apply(this, [props]);
    } finally {
      props = oldProps;
    }
  };

  // Configurar fonte padrão para TextInput
  const TextInputRender = TextInput.render;
  const initialTextInputDefaultProps = TextInput.defaultProps;
  TextInput.defaultProps = {
    ...initialTextInputDefaultProps,
    style: [{ fontFamily: Fonts.regular }, initialTextInputDefaultProps?.style],
  };
  TextInput.render = function render(props: any) {
    const oldProps = props;
    props = {
      ...props,
      style: [{ fontFamily: Fonts.regular }, props.style],
    };
    try {
      return TextInputRender.apply(this, [props]);
    } finally {
      props = oldProps;
    }
  };
};
