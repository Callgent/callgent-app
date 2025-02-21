import React from 'react';
import { Form, Input, Select } from 'antd';

type AuthType = 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';

interface AuthSchemeFormProps {
  authType: AuthType;
}

const EmptyForm: React.FC = () => (
  <div>
    <p>This authentication type is not supported yet.</p>
  </div>
);

const ApiKeyForm: React.FC = () => {
  return (
    <>
      <Form.Item
        label="Scheme In"
        name={['scheme', 'in']}
        rules={[{ required: true, message: 'Please select scheme in' }]}
      >
        <Select placeholder="Select scheme in">
          <Select.Option value="header">header</Select.Option>
          <Select.Option value="query">query</Select.Option>
          <Select.Option value="cookie">cookie</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Scheme Name"
        name={['scheme', 'name']}
        rules={[{ required: true, message: 'Please enter scheme name' }]}
      >
        <Input placeholder="Enter scheme name, e.g. 'x-api-key'" />
      </Form.Item>

      <Form.Item label="Provider" name={['scheme', 'provider']}>
        <Input placeholder="Enter provider, e.g. 'api.callgent.com'" />
      </Form.Item>

      <Form.Item label="Secret" name={['scheme', 'secret']}>
        <Input placeholder="Enter secret" />
      </Form.Item>
    </>
  );
};

const AuthSchemeForm: React.FC<AuthSchemeFormProps> = ({ authType }) => {
  switch (authType) {
    case 'apiKey':
      return <ApiKeyForm />;
    case 'http':
    case 'oauth2':
    case 'openIdConnect':
      return <EmptyForm />;
    default:
      return null;
  }
};

export default AuthSchemeForm;