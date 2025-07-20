import { withTheme } from '@rjsf/core';
import { Theme as AntDTheme } from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Mentions } from 'antd';
export default function RjsfAntd({ onSubmit, formRef, schema, uiProps }: {
    onSubmit: (form: any) => void;
    formRef: React.Ref<any>;
    schema: any;
    uiProps: any;
}) {
    // 自定义 ArrayFieldTemplate，带 Tailwind 样式
    const ArrayFieldTemplate = (props: any) => {
        const { items, canAdd, onAddClick, title } = props;
        return (
            <div className="mb-4 border rounded px-2">
                <div className="flex justify-between items-center py-1">
                    <div>{title}</div>
                    {canAdd && (
                        <Button
                            size="small"
                            type="text"
                            icon={<PlusOutlined className="p-1 border dark:border-gray-600 rounded" />}
                            onClick={onAddClick}
                            className="mr-2"
                        />
                    )}
                </div>
                {items.map((element: any) => (
                    <div key={element.index} className="border dark:border-gray-600 p-3 rounded relative mb-2">
                        {element.children}
                        {element.hasRemove && (
                            <Button
                                size="small"
                                type="text"
                                icon={<DeleteOutlined className="p-1 border dark:border-gray-600 rounded mb-2" />}
                                onClick={element.onDropIndexClick(element.index)}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // 自定义 FieldTemplate，使用 Tailwind 样式
    const FieldTemplate = (props: any) => {
        const { id, classNames, label, required, errors, help, children, schema } = props;
        const isObject = schema.type === 'object';
        return (
            <div className={`py-2 ${classNames}`}>
                {!isObject && label && (
                    <label htmlFor={id} className="block font-medium text-gray-700 mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                {children}
                <span className="text-red-500">{errors}</span>
                {help}
            </div>
        );
    };

    const ObjectFieldTemplate = (props: any) => {
        const { idSchema, title } = props;
        const isRoot = idSchema.$id === "root"
        return (
            <div className={`${!isRoot && 'hover:bg-gray-100 rounded'} text-sm p-1`}>
                {title}
                <div className={`${!isRoot && 'pl-2'}`}>
                    {props.properties.map((prop: any) => prop.content)}
                </div>
            </div>
        );
    };

    // 自定义 Widgets
    const customWidgets = {
        TextWidget: (props: any) => {
            return (
                <Mentions
                    prefix="{{"
                    placeholder="Type {{ to mention…"
                    value={props.value}
                    onChange={(e) => props.onChange(e)}
                    options={uiProps.mentions}
                    rows={3}
                />
            )
        }
    };

    // 组合模板
    const customTemplates = {
        ArrayFieldTemplate,
        FieldTemplate,
        ObjectFieldTemplate
    };

    // 创建 Theme
    const TailwindAntDTheme = {
        ...AntDTheme,
        widgets: {
            ...AntDTheme.widgets,
            ...customWidgets,
        },
        templates: {
            ...AntDTheme.templates,
            ...customTemplates
        },
    };
    // 包装 Form 组件
    const CustomForm = withTheme(TailwindAntDTheme);

    return (
        <div className="p-4 rounded border">
            <CustomForm
                schema={schema}
                validator={validator}
                onSubmit={onSubmit}
                ref={formRef}
                uiSchema={{
                    'ui:submitButtonOptions': {
                        norender: true,
                    },
                }}
            />
        </div>
    );
}
