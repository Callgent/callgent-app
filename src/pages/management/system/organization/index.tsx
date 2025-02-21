import { Button, Card, Col, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Tag } from "antd";
import { useEffect, useState } from "react";

import type { Organization } from "#/entity";

type SearchFormFieldType = Pick<Organization, "name" | "status">;

export default function OrganizationPage() {
	const [searchForm] = Form.useForm();
	const [organizationModalPros, setOrganizationModalProps] = useState<OrganizationModalProps>({
		formValue: {
			id: "",
			name: "",
			status: "enable",
		},
		title: "New",
		show: false,
		onOk: () => {
			setOrganizationModalProps((prev) => ({ ...prev, show: false }));
		},
		onCancel: () => {
			setOrganizationModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const onSearchFormReset = () => {
		searchForm.resetFields();
	};

	return (
		<Space direction="vertical" size="large" className="w-full">
			<Card>
				<Form form={searchForm}>
					<Row gutter={[16, 16]}>
						<Col span={24} lg={6}>
							<Form.Item<SearchFormFieldType> label="Name" name="name" className="!mb-0">
								<Input />
							</Form.Item>
						</Col>
						<Col span={24} lg={6}>
							<Form.Item<SearchFormFieldType> label="Status" name="status" className="!mb-0">
								<Select>
									<Select.Option value="enable">
										<Tag color="success">Enable</Tag>
									</Select.Option>
									<Select.Option value="disable">
										<Tag color="error">Disable</Tag>
									</Select.Option>
								</Select>
							</Form.Item>
						</Col>
						<Col span={24} lg={12}>
							<div className="flex justify-end">
								<Button onClick={onSearchFormReset}>Reset</Button>
								<Button type="primary" className="ml-4">
									Search
								</Button>
							</div>
						</Col>
					</Row>
				</Form>
			</Card>
			<OrganizationModal {...organizationModalPros} />
		</Space>
	);
}

type OrganizationModalProps = {
	formValue: Organization;
	title: string;
	show: boolean;
	onOk: VoidFunction;
	onCancel: VoidFunction;
};

function OrganizationModal({ title, show, formValue, onOk, onCancel }: OrganizationModalProps) {
	const [form] = Form.useForm();
	useEffect(() => {
		form.setFieldsValue({ ...formValue });
	}, [formValue, form]);
	return (
		<Modal title={title} open={show} onOk={onOk} onCancel={onCancel}>
			<Form initialValues={formValue} form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} layout="horizontal">
				<Form.Item<Organization> label="Name" name="name" required>
					<Input />
				</Form.Item>
				<Form.Item<Organization> label="Order" name="order" required>
					<InputNumber style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item<Organization> label="Status" name="status" required>
					<Radio.Group optionType="button" buttonStyle="solid">
						<Radio value="enable"> Enable </Radio>
						<Radio value="disable"> Disable </Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item<Organization> label="Desc" name="desc">
					<Input.TextArea />
				</Form.Item>
			</Form>
		</Modal>
	);
}
