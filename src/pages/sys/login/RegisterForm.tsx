import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";


import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/LoginStateProvider";
import { signup } from "@/api/services/userService";

function RegisterForm() {
	const { t } = useTranslation();

	const { loginState, backToLogin } = useLoginStateContext();
	if (loginState !== LoginStateEnum.REGISTER) return null;

	const onFinish = async (values: any) => {
		await signup(values);
		backToLogin();
	};

	return (
		<>
			<div className="mb-4 text-2xl font-bold xl:text-3xl">{t("sys.login.signUpFormTitle")}</div>
			<Form name="normal_login" size="large" initialValues={{ remember: true }} onFinish={onFinish}>
				<Form.Item name="name" rules={[{ required: true, message: t("sys.login.accountPlaceholder") }]}>
					<Input placeholder={t("sys.login.userName")} />
				</Form.Item>
				<Form.Item name="email" rules={[{ required: true, message: t("sys.login.emaildPlaceholder") }]}>
					<Input placeholder={t("sys.login.email")} />
				</Form.Item>
				<Form.Item name="credentials" rules={[{ required: true, message: t("sys.login.passwordPlaceholder") }]}>
					<Input.Password type="password" placeholder={t("sys.login.password")} />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" className="w-full">
						{t("sys.login.registerButton")}
					</Button>
				</Form.Item>

				<div className="mb-2 text-xs text-gray">
					<span>{t("sys.login.registerAndAgree")}</span>
					<a href="./" className="text-sm !underline">
						{t("sys.login.termsOfService")}
					</a>
					{" & "}
					<a href="./" className="text-sm !underline">
						{t("sys.login.privacyPolicy")}
					</a>
				</div>

				<ReturnButton onClick={backToLogin} />
			</Form>
		</>
	);
}

export default RegisterForm;
