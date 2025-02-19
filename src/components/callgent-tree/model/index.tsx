import { Modal } from 'antd';
import { ActionForm } from './TreeActionForm';
import { useCurrentNode, useTreeActions, useTreeActionStore } from '@/store/callgentTreeStore';

export const TreeActionModal = () => {
  const { isModalOpen, action } = useTreeActionStore();
  const { closeModal } = useTreeActions()
  const currentNode = useCurrentNode();

  const titleMap = {
    add: 'Create ' + currentNode?.modelTitle,
    edit: 'Edit ' + currentNode?.modelTitle,
    import: 'Import Api',
    lock: 'Manage Auth',
  };

  return (
    <Modal
      title={action ? titleMap[action] : 'action'}
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      destroyOnClose
    >
      <ActionForm />
    </Modal>
  );
};