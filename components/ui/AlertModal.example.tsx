/**
 * EXEMPLOS DE USO DO ALERTMODAL
 *
 * Este componente substitui o Alert.alert() nativo do React Native
 * com uma interface mais bonita e consistente com o design do app.
 */

import React from 'react';
import { View, Button } from 'react-native';
import { AlertModal, useAlert } from './AlertModal';

// ============================================
// EXEMPLO 1: Uso com Hook (Recomendado)
// ============================================
export function ProfileScreenExample() {
  const { showAlert, AlertComponent } = useAlert();

  const handleSaveSuccess = () => {
    showAlert(
      'Sucesso',
      'Perfil atualizado com sucesso!',
      [{ text: 'OK' }],
      'success'
    );
  };

  const handleError = () => {
    showAlert(
      'Erro',
      'Não foi possível atualizar o perfil.',
      [{ text: 'Tentar novamente' }],
      'error'
    );
  };

  const handleWarning = () => {
    showAlert(
      'Atenção',
      'Você tem certeza que deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', style: 'default', onPress: () => console.log('Continuou') }
      ],
      'warning'
    );
  };

  const handleDelete = () => {
    showAlert(
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            // Lógica de remoção aqui
            console.log('Foto removida');
          }
        }
      ],
      'warning'
    );
  };

  return (
    <View>
      <Button title="Mostrar Sucesso" onPress={handleSaveSuccess} />
      <Button title="Mostrar Erro" onPress={handleError} />
      <Button title="Mostrar Aviso" onPress={handleWarning} />
      <Button title="Mostrar Confirmação Destrutiva" onPress={handleDelete} />

      {/* IMPORTANTE: Adicionar o AlertComponent no final do componente */}
      <AlertComponent />
    </View>
  );
}

// ============================================
// EXEMPLO 2: Uso Direto com State (Alternativo)
// ============================================
export function DirectUsageExample() {
  const [showAlert, setShowAlert] = React.useState(false);

  return (
    <View>
      <Button title="Mostrar Alert" onPress={() => setShowAlert(true)} />

      <AlertModal
        visible={showAlert}
        type="success"
        title="Sucesso!"
        message="Operação realizada com sucesso."
        buttons={[
          { text: 'OK', onPress: () => console.log('OK pressionado') }
        ]}
        onClose={() => setShowAlert(false)}
      />
    </View>
  );
}

// ============================================
// EXEMPLO 3: Substituindo Alert.alert()
// ============================================

// ANTES (Alert.alert nativo):
/*
Alert.alert(
  'Sucesso',
  'Perfil atualizado com sucesso!',
  [{ text: 'OK' }]
);
*/

// DEPOIS (AlertModal com hook):
/*
const { showAlert, AlertComponent } = useAlert();

showAlert(
  'Sucesso',
  'Perfil atualizado com sucesso!',
  [{ text: 'OK' }],
  'success' // Adiciona ícone de sucesso
);

// No return do componente:
return (
  <>
    {/* Seu código aqui *\/}
    <AlertComponent />
  </>
);
*/

// ============================================
// EXEMPLO 4: Todos os tipos de alert
// ============================================
export function AllTypesExample() {
  const { showAlert, AlertComponent } = useAlert();

  return (
    <View>
      {/* Success - Verde com ícone de check */}
      <Button
        title="Success"
        onPress={() => showAlert('Sucesso', 'Operação realizada!', undefined, 'success')}
      />

      {/* Error - Vermelho com ícone de X */}
      <Button
        title="Error"
        onPress={() => showAlert('Erro', 'Algo deu errado!', undefined, 'error')}
      />

      {/* Warning - Amarelo com ícone de ! */}
      <Button
        title="Warning"
        onPress={() => showAlert('Atenção', 'Revise suas informações', undefined, 'warning')}
      />

      {/* Info - Azul com ícone de i */}
      <Button
        title="Info"
        onPress={() => showAlert('Informação', 'Esta é uma mensagem informativa', undefined, 'info')}
      />

      <AlertComponent />
    </View>
  );
}

// ============================================
// EXEMPLO 5: Múltiplos botões com estilos
// ============================================
export function MultipleButtonsExample() {
  const { showAlert, AlertComponent } = useAlert();

  const handleConfirmDelete = () => {
    showAlert(
      'Confirmar exclusão',
      'Esse processo é irreversível.',
      [
        {
          text: 'Fechar',
          style: 'cancel' // Texto cinza, estilo secundário
        },
        {
          text: 'Excluir conta',
          style: 'destructive', // Texto vermelho, estilo de ação destrutiva
          onPress: () => {
            console.log('Conta excluída');
          }
        }
      ],
      'warning'
    );
  };

  return (
    <View>
      <Button title="Mostrar Confirmação" onPress={handleConfirmDelete} />
      <AlertComponent />
    </View>
  );
}

// ============================================
// TIPOS DISPONÍVEIS
// ============================================
/*
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

Estilos de botão:
- 'default': Azul primário, fonte bold
- 'cancel': Cinza secundário, fonte regular
- 'destructive': Vermelho, fonte bold
*/
