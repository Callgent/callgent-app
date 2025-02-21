import React, { useRef, useState } from 'react';
import { Realm } from '#/entity';
import useTreeActionStore from '@/store/callgentTreeStore';
import NewAuth from './create-auth';
import { Tabs } from 'antd';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const Auth: React.FC<any> = () => {
  const { callgentTree } = useTreeActionStore();
  const [realms, setRealms] = useState<Realm[]>(callgentTree[0]?.realms || []);
  const [activeKey, setActiveKey] = useState<string>(realms[0]?.realmKey || 'new');
  const newTabIndex = useRef(0);

  const updateRealms = (type: 'edit' | 'add' | 'delete', updatedItem: Realm, realmKey: string) => {
    if (type === 'edit') {
      setRealms(prevRealms => prevRealms.map(realm =>
        realm.realmKey === realmKey ? updatedItem : realm
      ));
    } else if (type === 'add') {
      setRealms(prevRealms => [...prevRealms, updatedItem]);
      setActiveKey(updatedItem.realmKey);
    } else if (type === 'delete') {
      remove(realmKey);
    }
  };

  const add = () => {
    const newRealmKey = `newRealm${newTabIndex.current++}`;
    const newRealm: Realm = {
      realmKey: newRealmKey,
      authType: 'apiKey',
      realm: '',
      perUser: false,
      enabled: true
    };
    updateRealms('add', newRealm, newRealmKey);
  };

  const remove = (targetKey: TargetKey) => {
    const targetKeyStr = typeof targetKey === 'string' ? targetKey : targetKey.toString();
    let newActiveKey = activeKey;
    let lastIndex = -1;

    realms.forEach((realm, i) => {
      if (realm.realmKey === targetKeyStr) {
        lastIndex = i - 1;
      }
    });

    const newRealms = realms.filter(realm => realm.realmKey !== targetKeyStr);

    if (newRealms.length && activeKey === targetKeyStr) {
      newActiveKey = lastIndex >= 0 ? newRealms[lastIndex].realmKey : newRealms[0]?.realmKey || 'new';
    } else if (!newRealms.length) {
      newActiveKey = 'new';
    }

    setRealms(newRealms);
    setActiveKey(newActiveKey);
  };

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      add();
    } else {
      remove(targetKey);
    }
  };

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  const tabItems = realms.length > 0
    ? realms.map((item: Realm) => {
      return ({
        key: item.realmKey,
        label: item.authType,
        children: (
          <NewAuth
            initialData={item}
            callgentId={callgentTree[0].id}
            onUpdate={(updatedItem) => updateRealms('edit', updatedItem, item.realmKey)}
            onDelete={() => remove(item.realmKey)}
            isNew={item.realmKey.startsWith('newRealm')}
          />
        ),
        closable: false,
      })
    })
    : [{
      key: 'new',
      label: 'Add New Auth',
      children: <NewAuth callgentId={callgentTree[0]?.id} isNew={true} />,
      closable: false,
    }];

  return (
    <div>
      <Tabs
        type="editable-card"
        items={tabItems}
        activeKey={activeKey}
        onChange={onChange}
        onEdit={onEdit}
        hideAdd={realms.length === 0}
      />
    </div>
  );
};

export default Auth;