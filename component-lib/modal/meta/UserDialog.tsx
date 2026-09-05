import { Switch } from '@mui/material';
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Stack,
  Tooltip,
} from 'react-bootstrap';
import { Grid } from '@mui/joy';
import SelectPro from '../../../component-lib/select';
import Select from 'react-select';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { defaultUserFormValues } from '@/service/meta';
import { ToastContainer, toast } from 'react-toastify';
import { useAtom } from 'jotai';
import { openUserModalAtom } from '@/stores/atom';
import Link from 'next/link';
import { IUser } from '@/types/user';
import { useCreateUser, useUpdateUser } from '@/rest/users';
import { toastOptions } from '@/utils/public';
import _ from 'lodash';
import { useGetAllVendors } from '@/rest/vendor';
import { showErrorMessages } from '@/service/showErrorMessages';
import { useTranslation } from 'react-i18next';

export function UserDialog(prop: any) {
  const { t } = useTranslation('user');
  const { t: t0 } = useTranslation('common');
  const { editingItem, showAddBt, setEditItem } = prop; //编辑时用来初始化数据的

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  type OptionType = {
    value: string;
    label: string;
  };
  // Values  -------------------------------------------------
  const options: OptionType[] = [
    { value: 'USER', label: 'USER' },
    { value: 'ADMIN', label: 'ADMIN' },
    { value: 'SINV_USER', label: 'SHARED INV USER' },
  ];
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [show, setShow] = useAtom(openUserModalAtom);
  // UseState  -----------------------------------------------
  const [formStatus, setFormStatus] = React.useState<string>('create'); // 判断是Create还是update
  const [selectedItem, setSelectedItem] = React.useState<any>(); //选中的Item 编辑态需要初始化

  // UseForm  ------------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    getValues,
  } = useForm<IUser>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultUserFormValues as any,
  });
  // Hooks  --------------------------------------------------
  const { data: vendorsData } = useGetAllVendors({
    type: 2,
    isOnlyOwnItem: true,
  });
  const {
    mutate: update,
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    serverError: updateError,
  } = useUpdateUser();
  const {
    mutate: create,
    data: dataCreate,
    isLoading: isLoadingCreate,
    serverError: createError,
  } = useCreateUser();
  // Use Effect  ---------------------------------------------
  // 编辑态时的初始化数据
  // 打开时初始化
  useEffect(() => {
    if (show && !editingItem) {
      // @ts-ignore
      reset(defaultUserFormValues);
      setSelectedItem(undefined);
      setFormStatus('create');
      setEditItem(undefined);
    }
    // --------------------------------------------------------------------------------------------------------------------
    if (show && editingItem && Object.keys(editingItem).length > 0) {
      editingItem.role = {
        value: editingItem.role,
        label: editingItem.role,
      };

      editingItem.password = '';
      reset(editingItem);
      if (editingItem.vendor) {
        setValue('vendor', {
          value: editingItem.vendor.id,
          label: editingItem.vendor.name,
        });
      }
      // reset({ isActive: false });
      setFormStatus('update');
    }
    if (!show) setEditItem(undefined);
  }, [show]);

  useEffect(() => {
    if (dataCreate?.code === 0) {
      toast.success(`Save successfully`, toastOptions);
      setEditItem(undefined);
      setShow(false);
    } else if (dataCreate && dataCreate?.code > 0) {
      toast.error(`Save failed ${dataCreate.data}`, toastOptions);
      setShow(false);
    } else if (createError) {
      toast.error(createError, toastOptions);
      setShow(false);
    }
  }, [dataCreate, createError]);

  useEffect(() => {
    if (dataUpdate?.code === 0) {
      toast.success(`Save successfully`, toastOptions);
      setEditItem(undefined);
      setShow(false);
    } else if (dataUpdate && dataUpdate?.code > 0) {
      toast.error(`Save failed ${dataUpdate.data}`, toastOptions);
      setShow(false);
    } else if (updateError) {
      toast.error(updateError, toastOptions);
      setShow(false);
    }
  }, [dataUpdate, updateError]);

  // Function ------------------------------------------------
  const checkBeforeSubmit = (data: IUser) => {
    const errors: string[] = []; // 使用数组存储错误信息
    if (data.role && data.role.value === 'SINV_USER') {
      if (_.isNil(data.vendor)) {
        errors.push('You must select a vendor');
      }
    }

    if (formStatus === 'create') {
      if (_.isEmpty(data.password)) {
        errors.push('Please input password');
      }
    }

    if (errors.length > 0) {
      showErrorMessages(errors);
      return false;
    }
    return true;
  };
  // Save
  const save = (data: IUser) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('save');
    }
  };

  // Submit
  const onSubmit = (data: IUser) => {
    data.role = data.role.value;
    if (data.vendor) {
      data.vendorId = data.vendor.value;
    }

    const { password, ...newData } = data;
    if (_.isString(data.password) && !_.isEmpty(_.trim(data.password))) {
      // @ts-ignore
      newData.password = data.password;
    }

    if (formStatus === 'create' && data) {
      create(newData as IUser);
    }
    if (formStatus === 'update' && data) update(newData as IUser);
  };

  return (
    <>
      {showAddBt && (
        <Link className="btn ripple btn-primary" href="#!" onClick={handleShow}>
          <i className="fe fe-plus me-2"></i>
          {t('add_user')}
        </Link>
      )}

      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>
            {t('lb_user')} - {formStatus}
          </Modal.Title>
          <Button variant="" onClick={handleClose}>
            X{' '}
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(save)}>
            <Form.Group className="form-group">
              <Form.Label>{t('lb_name')}</Form.Label>
              <Form.Control
                autoFocus
                {...register('firstName', {
                  required: true,
                })}
                placeholder={t('lb_name')}
                type="text"
              />
              {errors.firstName && (
                <Form.Text className="text-danger">
                  {errors.firstName.message as string}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>{t('lb_last_name')}</Form.Label>
              <Form.Control
                autoFocus
                {...register('lastName', {
                  required: true,
                })}
                placeholder={t('lb_last_name')}
                type="text"
              />
              {errors.firstName && (
                <Form.Text className="text-danger">
                  {errors.firstName.message as string}
                </Form.Text>
              )}
            </Form.Group>

            <Grid container spacing={1}>
              <Grid xs={12} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_role')}</Form.Label>
                  <div>
                    <Controller
                      key="role"
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className=""
                          value={field.value}
                          // rules={{ required: 'Username is required' }}
                          onChange={(value) => {
                            field.onChange(value);
                            if (value !== 'SINV_USER') {
                              setValue('vendor', {});
                            }
                          }}
                          // @ts-ignore
                          options={options}
                          isMulti={false}
                          // @ts-ignore
                          rules={{ required: 'Required' }}
                        />
                      )}
                    />
                  </div>
                </Form.Group>
              </Grid>
              <Grid xs={12} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>
                    {t('lb_vendor')}
                    {`(only have private item)`}
                  </Form.Label>
                  <div>
                    {vendorsData?.data && (
                      <SelectPro
                        key="vendor"
                        name="vendor"
                        control={control}
                        defaultValue={undefined}
                        options={vendorsData.data}
                        isMulti={false}
                        rules={{ required: 'Vendor is required' }}
                        filterOption={undefined}
                        isDisabled={false}
                        onChangeHandler={undefined}
                      />
                    )}
                  </div>
                </Form.Group>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid xs={12} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_email')}</Form.Label>
                  <Form.Control
                    {...register('email', {
                      required: false,
                    })}
                    placeholder={t('lb_email')}
                    type="text"
                  />
                </Form.Group>
              </Grid>
              <Grid xs={12} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_password')}</Form.Label>
                  <Form.Control
                    {...register('password', {
                      required: false,
                    })}
                    placeholder={t('lb_password')}
                    type="text"
                  />
                </Form.Group>
              </Grid>
            </Grid>

            <Form.Group className="form-group">
              <Form.Label>{t('lb_phone')}</Form.Label>
              <Form.Control
                {...register('phone', {
                  required: false,
                })}
                placeholder={t('lb_phone')}
                type="text"
              />
            </Form.Group>
          </Form>
          <Grid xs={12} md={6}>
            <Form.Group className="form-group">
              <Stack direction="horizontal" className="mg-t-30">
                <span>{t('lb_active')}</span>
                <Controller
                  key="isActive"
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      // rules={{ required: 'Username is required' }}
                      onChange={(value) => {
                        // @ts-ignore
                        field.onChange(value);
                      }}
                      checked={field.value}
                    />
                  )}
                />
              </Stack>
            </Form.Group>
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          {formStatus !== 'save' ? (
            <>
              <Button variant="secondary" onClick={handleClose}>
                {t0('btn_cancel')}
              </Button>
              <Button variant="primary" onClick={handleSubmit(save)}>
                {t0('btn_save')}
              </Button>
            </>
          ) : (
            <Button variant="primary" disabled={true}>
              {t0('btn_saving')}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
