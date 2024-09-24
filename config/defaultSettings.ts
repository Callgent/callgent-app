import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * // https://procomponents.ant.design/en-US/components/layout
 */

const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  "navTheme": "light",
  "colorPrimary": "#1890ff",
  "layout": "mix",
  "contentWidth": "Fluid",
  "fixedHeader": false,
  "fixSiderbar": true,
  "pwa": true,
  "logo": "/logo.svg",
  "token": {},
  "footerRender": false,
  "siderMenuType": "group"
};

export default Settings;
