import { Modal } from 'antd';
import { ActionForm } from './TreeActionForm';
import { useTreeActions, useTreeActionStore } from '@/models/callgentTreeStore';

export const TreeActionModal = () => {
  const { isModalOpen, action, currentNode } = useTreeActionStore();
  const { closeModal } = useTreeActions()

  const titleMap = {
    add: 'Create ' + currentNode?.modelTitle,
    edit: 'Edit ' + currentNode?.modelTitle,
    import: 'Import Api',
    lock: 'Manage Auth',
    virtualApi: 'Manage virtualApi',
    select: 'Manage select',
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