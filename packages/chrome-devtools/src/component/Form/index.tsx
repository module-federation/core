import { SetStateAction, ReactNode, useEffect } from 'react';
import { flushSync } from 'react-dom';
import {
  Checkbox,
  Button,
  Empty,
  Tooltip,
  Badge,
  Form,
  Select,
  Switch,
  FormInstance,
} from '@arco-design/web-react';
import {
  IconDelete,
  IconPlus,
  IconInfoCircle,
} from '@arco-design/web-react/icon';

import { defaultDataItem, proxyFormField } from '../../template/constant';
import {
  validateCustom,
  validateSemver,
  validatePort,
  isObject,
  separateType,
  FormItemStatus,
  RootComponentProps,
} from '../../utils';
import styles from './index.module.scss';

const FormItem = Form.Item;
const FormList = Form.List;
const { Option } = Select;

interface FormProps {
  form: FormInstance<any, any, string | number | symbol>;
  condition: {
    status: string;
    message: string;
    color: string;
  };
  formStatus: Array<FormItemStatus>;
  setFormStatus: React.Dispatch<SetStateAction<FormItemStatus[]>>;
  validateForm: any;
  enableHMR: string;
  onHMRChange: (on: boolean) => void;
}
const FormComponent = (props: FormProps & RootComponentProps) => {
  const {
    form,
    condition,
    formStatus,
    setFormStatus,
    validateForm,
    enableHMR,
    onHMRChange,
    versionList,
    setVersionList,
    getVersion,
    customValueValidate,
  } = props;
  const { moduleInfo } = window.__FEDERATION__;
  let { producer } = separateType(moduleInfo);
  const filterDupMap = new Map();
  producer = producer.filter((t) => {
    const [typeOrName, name] = t.split(':');
    const marked = filterDupMap.get(name || typeOrName);
    filterDupMap.set(name || typeOrName, true);
    return !marked;
  });
  const formatProducer = producer.map((id) => {
    const hasType = id.includes(':');
    if (hasType) {
      return {
        label: id.split(':')[1],
        value: id,
      };
    } else {
      return {
        label: id,
        value: id,
      };
    }
  });

  useEffect(() => {
    producer.forEach(async (target) => {
      const version = await getVersion?.(target);
      const list = [...(versionList || [])];
      if (version) {
        list.push(version);
      }
      setVersionList?.(list);
    });
  }, []);

  const getCheckStatus = (index: number) => {
    const formData = form.getFieldsValue();
    return formData[proxyFormField][index].checked;
  };

  const validateKey = (
    key: string,
    callback: { (error?: ReactNode): void; (arg0: string | undefined): any },
    index: number,
  ) => {
    const status = getCheckStatus(index);
    if (!status) {
      return callback();
    }

    const statusSet = [...formStatus];
    if (!isObject(statusSet[index])) {
      statusSet[index] = {
        keyStatus: false,
        valueStatus: false,
      };
    }

    if (key) {
      statusSet[index].keyStatus = true;
      flushSync(() => setFormStatus(statusSet));
      return callback();
    }
    statusSet[index].keyStatus = false;
    flushSync(() => setFormStatus(statusSet));
    return callback('Module name can not be empty');
  };

  const validateValue = (
    value: string,
    callback: { (error?: ReactNode): void; (arg0: string | undefined): any },
    index: number,
  ) => {
    const status = getCheckStatus(index);
    if (!status) {
      return callback();
    }

    const statusSet = [...formStatus];
    if (!isObject(statusSet[index])) {
      statusSet[index] = {
        keyStatus: false,
        valueStatus: false,
      };
    }

    if (
      validateCustom(value) ||
      validateSemver(value) ||
      validatePort(value) ||
      customValueValidate?.(value)
    ) {
      statusSet[index].valueStatus = true;
      flushSync(() => setFormStatus(statusSet));
      return callback();
    }

    statusSet[index].valueStatus = false;
    flushSync(() => setFormStatus(statusSet));
    return callback(
      'The module information format is incorrect, check the format in the upper left corner',
    );
  };

  const onAdd = (add: {
    (defaultValue?: any, index?: number | undefined): void;
    (arg0: { key: string; value: string; checked: boolean }): void;
  }) => {
    add(defaultDataItem);
    setVersionList?.([...(versionList || []), []]);
    validateForm();
  };

  const onRemove = (remove: (index: number) => void, index: number) => {
    if (Array.isArray(versionList)) {
      versionList.splice(index, 1);
      setVersionList?.(versionList);
    }
    remove(index);
  };

  const hmrChange = (on: boolean) => {
    onHMRChange(on);
  };

  const onKeyChange = async (key: string, index: number) => {
    const version = await getVersion?.(key);
    if (version) {
      const list = [...(versionList || [])];
      list.splice(index, 1, version);
      setVersionList?.(list);
    }
  };

  return (
    <FormList field={proxyFormField}>
      {(fields, { add, remove }) => (
        <div>
          <div className={styles.header}>
            <Tooltip
              content={
                <div>
                  Example: Customize the remote module address, which should end
                  with 「.json」, for example key: @module-federation/button,
                  value: http://localhost:3000/mf-manifest.json
                </div>
              }
            >
              <IconInfoCircle />
            </Tooltip>
            <div className={styles.title}>Module Proxy</div>
            <Button
              icon={<IconPlus />}
              shape="circle"
              className={styles.add}
              onClick={() => onAdd(add)}
              data-set-e2e={'e2eAdd'}
            />

            <div className={styles.status}>
              <Badge color={condition.color} className={styles.badge} />
              <span className={styles.message}>{condition.message}</span>
              <Switch
                checked={enableHMR === 'enable'}
                checkedText={'Enable HMR'}
                uncheckedText={'Disable HMR'}
                onChange={hmrChange}
                className={styles.switch}
              />
            </div>
          </div>

          {fields.length ? (
            <>
              {fields.map((item, index) => (
                <div
                  className={styles.container}
                  key={item.field}
                  data-set-e2e={'e2eProxyItem'}
                >
                  <div>
                    <FormItem
                      field={`${item.field}.checked`}
                      triggerPropName={'checked'}
                    >
                      <Checkbox className={styles.checkBox} />
                    </FormItem>
                  </div>

                  <div className={styles.input}>
                    <FormItem
                      field={`${item.field}.key`}
                      rules={[
                        {
                          validator: (value, cb) =>
                            validateKey(value, cb, index),
                        },
                      ]}
                    >
                      <Select
                        data-set-e2e={'e2eProxyKey'}
                        placeholder={'Module Name'}
                        onChange={(key) => onKeyChange(key, index)}
                        allowClear
                        showSearch
                      >
                        {formatProducer.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                  </div>

                  <div className={styles.input}>
                    <FormItem
                      field={`${item.field}.value`}
                      rules={[
                        {
                          validator: (value, cb) =>
                            validateValue(value, cb, index),
                        },
                      ]}
                    >
                      <Select
                        data-set-e2e={'e2eProxyValue'}
                        placeholder={'Custom Manifest URL'}
                        allowClear
                        showSearch
                        allowCreate
                      >
                        {(versionList || [])?.[index]?.map((version) => (
                          <Option key={version} value={version}>
                            {version}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                  </div>

                  <Button
                    icon={<IconDelete />}
                    shape="circle"
                    status="danger"
                    className={styles.delete}
                    data-set-e2e={'e2eDelete'}
                    onClick={() => onRemove(remove, index)}
                  />
                </div>
              ))}
            </>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </FormList>
  );
};

export default FormComponent;
