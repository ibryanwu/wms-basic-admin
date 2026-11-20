import { Switch } from '@mui/material';
import {
  Button,
  Form,
  Modal,
  Stack,
} from 'react-bootstrap';
import { Grid } from '@mui/joy';
import SelectPro from '../../../component-lib/select';
import Select from 'react-select';
import React, { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { defaultUserFormValues } from '@/service/meta';
import { toast } from 'react-toastify';
import { useAtom } from 'jotai';
import { openUserModalAtom } from '@/stores/atom';
import Link from 'next/link';
import { IUser } from '@/types/user';
import { useCreateUser, useUpdateUser } from '@/rest/users';
import { useGetAllRoles } from '@/rest/role';
import { toastOptions } from '@/utils/public';
import _ from 'lodash';
import { useGetAllVendors } from '@/rest/vendor';
import { showErrorMessages } from '@/service/showErrorMessages';
import { useTranslation } from 'react-i18next';

type RoleOptionType = {
  value: number;
  label: string;
  code?: string;
};

export function UserDialog(prop: any) {
  const { t } = useTranslation('user');
  const { t: t0 } = useTranslation('common');
  const { editingItem, showAddBt, setEditItem } = prop;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { data: rolesData, refetch: refetchRoles } = useGetAllRoles();
  const roleOptions: RoleOptionType[] =
    Array.isArray(rolesData) && rolesData.length > 0
      ? rolesData
          .filter((r: { isActive?: boolean }) => r.isActive !== false)
          .map((r: { id: number; name: string; code?: string }) => ({
            value: r.id,
            label: r.name,
            code: r.code,
          }))
      : [];

  const [show, setShow] = useAtom(openUserModalAtom);
  const [formStatus, setFormStatus] = React.useState<string>('create');
  const initialRoleSetForEditRef = useRef<string | number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<IUser>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultUserFormValues as any,
  });

  const { data: vendorsData } = useGetAllVendors({
    type: 2,
    isOnlyOwnItem: true,
  });
  const {
    mutate: update,
    data: dataUpdate,
    serverError: updateError,
  } = useUpdateUser();
  const {
    mutate: create,
    data: dataCreate,
    serverError: createError,
  } = useCreateUser();

  useEffect(() => {
    if (show) {
      refetchRoles();
    }
  }, [show, refetchRoles]);

  useEffect(() => {
    if (show && !editingItem) {
      reset(defaultUserFormValues as any);
      setFormStatus('create');
      setEditItem(undefined);
    }
    if (show && editingItem && Object.keys(editingItem).length > 0) {
      const item = { ...editingItem, password: '' };
      reset(item);
      if (editingItem.vendor) {
        setValue('vendor', {
          value: editingItem.vendor.id,
          label: editingItem.vendor.name,
        });
      }
      setFormStatus('update');
    }
    if (!show) setEditItem(undefined);
  }, [show]);

  const editingItemId = editingItem?.id ?? null;
  const roleOptionsLength = roleOptions.length;
  useEffect(() => {
    if (!show) {
      initialRoleSetForEditRef.current = null;
      return;
    }
    if (
      !editingItem ||
      Object.keys(editingItem).length === 0 ||
      roleOptionsLength === 0
    ) {
      return;
    }
    if (initialRoleSetForEditRef.current === editingItemId) return;
    initialRoleSetForEditRef.current = editingItemId;

    const roleId =
      editingItem.roleId ??
      editingItem.role?.id ??
      (typeof editingItem.role === 'object' && editingItem.role?.value != null
        ? editingItem.role.value
        : null);
    const roleLabel =
      editingItem.role?.name ??
      editingItem.role?.label ??
      (typeof editingItem.role === 'string' ? editingItem.role : null);

    if (roleId != null) {
      const matched =
        roleOptions.find((o) => o.value === roleId) ??
        (roleLabel
          ? roleOptions.find(
              (o) => o.label === roleLabel || (o.code && o.code === roleLabel),
            )
          : null);
      if (matched) setValue('role', matched);
    } else if (roleLabel) {
      const matched = roleOptions.find(
        (o) => o.label === roleLabel || (o.code && o.code === roleLabel),
      );
      if (matched) setValue('role', matched);
    }
  }, [show, editingItemId, roleOptionsLength, editingItem, roleOptions, setValue]);

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
  }, [dataCreate, createError, setEditItem, setShow]);

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
  }, [dataUpdate, updateError, setEditItem, setShow]);

  const checkBeforeSubmit = (data: IUser) => {
    const validationErrors: string[] = [];
    if (!data.role || (data.role as RoleOptionType).value == null) {
      validationErrors.push('Please select a role');
    }
    if (
      data.role &&
      (data.role as RoleOptionType).code === 'SINV_USER'
    ) {
      if (_.isNil(data.vendor)) {
        validationErrors.push('You must select a vendor');
      }
    }

    if (formStatus === 'create') {
      if (_.isEmpty(data.password)) {
        validationErrors.push('Please input password');
      }
    }

    if (validationErrors.length > 0) {
      showErrorMessages(validationErrors);
      return false;
    }
    return true;
  };

  const save = (data: IUser) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('save');
    }
  };

  const onSubmit = (data: IUser) => {
    const roleId =
      data.role &&
      typeof data.role === 'object' &&
      (data.role as RoleOptionType).value != null
        ? (data.role as RoleOptionType).value
        : null;

    if (data.vendor) {
      data.vendorId = data.vendor.value;
    }

    const { password, role, ...rest } = data;
    const newData: any = { ...rest, roleId };
    if (_.isString(data.password) && !_.isEmpty(_.trim(data.password))) {
      newData.password = data.password;
    }

    if (formStatus === 'create' && data) {
      create(newData as IUser);
    }
    if (formStatus === 'update' && data) {
      update(newData as IUser);
    }
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
                          onChange={(value) => {
                            field.onChange(value);
                            if (
                              !value ||
                              (value as RoleOptionType).code !== 'SINV_USER'
                            ) {
                              setValue('vendor', {});
                            }
                          }}
                          options={roleOptions}
                          isMulti={false}
                          isLoading={roleOptions.length === 0}
                          placeholder={
                            roleOptions.length === 0
                              ? t('loading_roles', 'Loading roles…')
                              : t('select_role', 'Select role')
                          }
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
                      onChange={(value) => {
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