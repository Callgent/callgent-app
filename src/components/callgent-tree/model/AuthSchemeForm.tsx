import React from 'react';
import { Form, Input, Select, Switch } from 'antd';
import { Realm } from '#/entity';

interface AuthSchemeFormProps {
  formValues: Realm;
}

const EmptyForm: React.FC = () => (
  <div>
    <p>This authentication type is not supported yet.</p>
  </div>
);

const ApiKeyForm: React.FC<AuthSchemeFormProps> = ({ formValues }) => {
  const isPricingEnabled = formValues?.pricingEnabled;
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
        label="Name"
        name='realm'
        rules={[{ required: true, message: 'Please enter scheme name' }]}
      >
        <Input placeholder="Enter scheme realm, e.g. 'x-api-key'" />
      </Form.Item>

      {formValues?.realmKey ? (
        <Form.Item label="Provider" name='provider'>
          <Input placeholder="Enter provider, e.g. 'api.callgent.com'" />
        </Form.Item>
      ) : null}

      <Form.Item label="Secret" name={['scheme', 'secret']}>
        <Input placeholder="Enter secret, leave empty for user to fill in" />
      </Form.Item>

      <Form.Item label="ValidationUrl" name={['scheme', 'validationUr']}>
        <Input placeholder="Enter validationUr, leave empty for user to fill in" />
      </Form.Item>

      <Form.Item
        label="Enable Pricing"
        name="pricingEnabled"
        valuePropName="checked"
        initialValue={(formValues?.pricing?.perRequest || formValues?.pricing?.perResponse) ? true : false}
      >
        <Switch />
      </Form.Item>

      {isPricingEnabled && (
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues?.pricing?.perRequest !== currentValues?.pricing?.perRequest ||
            prevValues?.pricing?.perResponse !== currentValues?.pricing?.perResponse
          }
        >
          {({ getFieldValue }) => {
            const priceValue = getFieldValue(['pricing', 'perRequest']);
            const calcPriceFunctionValue = getFieldValue(['pricing', 'perResponse']);
            const showPriceInput = !calcPriceFunctionValue;
            const showFunctionInput = !priceValue;
            return (
              <>
                {showPriceInput && (
                  <Form.Item
                    label="Fixed Price Per Request"
                    name={['pricing', 'perRequest']}
                  >
                    <Input
                      placeholder="Enter price in cents"
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </Form.Item>
                )}

                {showFunctionInput && (
                  <Form.Item
                    label="Calculate Price Per Request"
                    name={['pricing', 'perResponse']}
                  >
                    <Input.TextArea
                      placeholder="Enter JS function calcPrice(req): [(resp) => int] / Per Response, 1billion=$0.01"
                      rows={4}
                      className="w-[300px]"
                    />
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>
      )}
    </>
  );
};

const JwtForm: React.FC<AuthSchemeFormProps> = ({ formValues }) => {
  const isPricingEnabled = formValues?.pricingEnabled;
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
        label="Realm"
        name='realm'
        rules={[{ required: true, message: 'Please enter scheme name' }]}
      >
        <Input placeholder="Enter scheme realm, e.g. 'x-api-key'" />
      </Form.Item>

      {formValues?.realmKey ? (
        <Form.Item label="Provider" name='provider'>
          <Input placeholder="Enter provider, e.g. 'api.callgent.com'" />
        </Form.Item>
      ) : null}

      <Form.Item label="ValidationUrl" name={['scheme', 'validationUrl']}>
        <Input placeholder="Enter validationUr, leave empty for user to fill in" />
      </Form.Item>

      <Form.Item
        label="Enable Pricing"
        name="pricingEnabled"
        valuePropName="checked"
        initialValue={(formValues?.pricing?.perRequest || formValues?.pricing?.perResponse) ? true : false}
      >
        <Switch />
      </Form.Item>

      {isPricingEnabled && (
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues?.pricing?.perRequest !== currentValues?.pricing?.perRequest ||
            prevValues?.pricing?.perResponse !== currentValues?.pricing?.perResponse
          }
        >
          {({ getFieldValue }) => {
            const priceValue = getFieldValue(['pricing', 'perRequest']);
            const calcPriceFunctionValue = getFieldValue(['pricing', 'perResponse']);
            const showPriceInput = !calcPriceFunctionValue;
            const showFunctionInput = !priceValue;
            return (
              <>
                {showPriceInput && (
                  <Form.Item
                    label="Fixed Price Per Request"
                    name={['pricing', 'perRequest']}
                  >
                    <Input
                      placeholder="Enter price in cents"
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </Form.Item>
                )}

                {showFunctionInput && (
                  <Form.Item
                    label="Calculate Price Per Request"
                    name={['pricing', 'perResponse']}
                  >
                    <Input.TextArea
                      placeholder="Enter JS function calcPrice(req): [(resp) => int] / Per Response, 1billion=$0.01"
                      rows={4}
                      className="w-[300px]"
                    />
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>
      )}
    </>
  );
};

const AuthSchemeForm: React.FC<AuthSchemeFormProps> = ({ formValues }) => {
  switch (formValues?.authType) {
    case 'apiKey':
      return <ApiKeyForm formValues={formValues} />;
    case 'jwt':
      return <JwtForm formValues={formValues} />;
    case 'http':
    case 'oauth2':
    case 'openIdConnect':
      return <EmptyForm />;
    default:
      return null;
  }
};

export default AuthSchemeForm;