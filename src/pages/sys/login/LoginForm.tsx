import { Button, Checkbox, Col, Divider, Form, Input, Row } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AiFillGithub, AiFillGoogleCircle } from "react-icons/ai";

import type { SignInReq } from "@/api/services/userService";
import { useSignIn } from "@/store/userStore";

import { LoginStateEnum, useLoginStateContext } from "./providers/LoginStateProvider";

function LoginForm() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);

	const { loginState, setLoginState } = useLoginStateContext();
	const signIn = useSignIn();

	if (loginState !== LoginStateEnum.LOGIN) return null;

	const handleFinish = async ({ username, password }: SignInReq) => {
		setLoading(true);
		try {
			await signIn({ username, password });
		} finally {
			setLoading(false);
		}
	};
	return (
		<>
			<div className="mb-8 text-2xl font-bold xl:text-3xl">{t("sys.login.signInFormTitle")}</div>
			<Form
				name="login"
				size="large"
				initialValues={{
					remember: true,
					username: "",
					password: "",
				}}
				onFinish={handleFinish}
			>
				<Form.Item name="username" rules={[{ required: true, message: t("sys.login.accountPlaceholder") }]}>
					<Input placeholder={t("sys.login.userName")} />
				</Form.Item>
				<Form.Item name="password" rules={[{ required: true, message: t("sys.login.passwordPlaceholder") }]}>
					<Input.Password type="password" placeholder={t("sys.login.password")} />
				</Form.Item>
				<Form.Item>
					<Row align="middle">
						<Col span={12}>
							<Form.Item name="remember" valuePropName="checked" noStyle>
								<Checkbox>{t("sys.login.rememberMe")}</Checkbox>
							</Form.Item>
						</Col>
						<Col span={12} className="text-right">
							<Button
								type="link"
								className="!underline"
								onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
								size="small"
							>
								{t("sys.login.forgetPassword")}
							</Button>
						</Col>
					</Row>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" className="w-full" loading={loading}>
						{t("sys.login.loginButton")}
					</Button>
				</Form.Item>

				<Row align="middle" gutter={8}>
					<Col span={6} flex="1" onClick={() => setLoginState(LoginStateEnum.REGISTER)}>
						<Button className="w-full !text-sm">{t("sys.login.signUpFormTitle")}</Button>
					</Col>
				</Row>

				<Divider className="!text-xs">{t("sys.login.otherSignIn")}</Divider>

				<div className="flex cursor-pointer justify-around text-2xl">
					<AiFillGithub />
					<AiFillGoogleCircle />
				</div>
			</Form>
		</>
	);
}

export default LoginForm;
