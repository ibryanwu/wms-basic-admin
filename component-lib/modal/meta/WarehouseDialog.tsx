import { Switch } from '@mui/material';
import { Button, Form, Modal } from 'react-bootstrap';

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { defaultWarehouseFormValues } from '@/service/meta';
import { IWarehouse } from '@/types/inv';
import { ToastContainer, toast } from 'react-toastify';
import { useCreateWarehouse, useUpdateWarehouse } from '@/rest/inv';
import { useAtom } from 'jotai';
import { openWarehouseModalAtom } from '@/stores/atom';
import { toastOptions } from '@/utils/public';
import { useTranslation } from 'react-i18next';

export function WarehouseDialog(prop: any) {
  const { t } = useTranslation('warehouse');
  const { t: t0 } = useTranslation('common');
  const { editingItem, showAddBt, setEditItem } = prop; //编辑时用来初始化数据的
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [show, setShow] = useAtom(openWarehouseModalAtom);
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
  } = useForm<IWarehouse>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultWarehouseFormValues as any,
  });
  // Hooks  --------------------------------------------------
  const {
    mutate: update,
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    serverError: updateError,
  } = useUpdateWarehouse();

  const {
    mutate: create,
    data: dataCreate,
    isLoading: isLoadingCreate,
    serverError: createError,
  } = useCreateWarehouse();
  // Use Effect  ---------------------------------------------
  // 编辑态时的初始化数据
  // 打开时初始化
  useEffect(() => {
    if (show && !editingItem) {
      // @ts-ignore
      reset(defaultWarehouseFormValues);
      setSelectedItem(undefined);
      setFormStatus('create');
      setEditItem(undefined);
    }
    if (show && editingItem && Object.keys(editingItem).length > 0) {
      reset(editingItem);
      // reset({ isActive: false });
      setFormStatus('update');
    }
    if (!show) setEditItem(undefined);
  }, [show]);

  useEffect(() => {}, [editingItem]);

  useEffect(() => {
    if (dataCreate?.code === 0) {
      toast.success(`Save warehouse successfully`, toastOptions);
      setEditItem(undefined);
    }
    if (dataCreate && dataCreate?.code > 0) {
      toast.success(`Save failed ${dataCreate.data}`, toastOptions);
    }
    if (createError) {
      toast.error(createError, toastOptions);
    }
    setShow(false);
  }, [dataCreate, createError]);

  useEffect(() => {
    if (dataUpdate?.code === 0) {
      toast.success(`Save warehouse successfully`, toastOptions);
      setEditItem(undefined);
    }
    if (dataCreate && dataCreate?.code > 0) {
      toast.success(`Save failed ${dataCreate.data}`, toastOptions);
    }
    if (updateError) {
      toast.error(updateError, toastOptions);
    }
    setShow(false);
  }, [dataUpdate, updateError]);

  // Function ------------------------------------------------
  const checkBeforeSubmit = (data: IWarehouse) => {
    let errorMsg = '';
    errorMsg += '';

    if (errorMsg !== '') {
      toast.error(`Please Select ${errorMsg}`, toastOptions);
      return false;
    }
    return true;
  };
  // Save
  const save = (data: IWarehouse) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('save');
    }
  };

  // Submit
  const onSubmit = (data: IWarehouse) => {
    if (formStatus === 'create' && data) create(data);
    if (formStatus === 'update' && data)
      update({ data, id: data.id as string });
  };

  return (
    <>
      {showAddBt && (
        <Button variant="primary" onClick={handleShow}>
          <i className="fe fe-plus me-2"></i>
          {t('add_warehouse')}
        </Button>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>
            {t('lb_warehouse')} - {formStatus}
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
                {...register('name', {
                  required: true,
                })}
                placeholder={t('lb_name')}
                type="text"
                style={{ textAlign: 'right' }}
                onFocus={(e) => {
                  // 在获得焦点时全选输入框中的内容
                  e.target.select();
                }}
              />
              {errors.name && (
                <Form.Text className="text-danger">
                  {errors.name.message as string}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>{t('lb_description')}</Form.Label>
              <Form.Control
                {...register('description', {
                  required: false,
                })}
                placeholder=""
                type="text"
                style={{ textAlign: 'right' }}
                onFocus={(e) => {
                  // 在获得焦点时全选输入框中的内容
                  e.target.select();
                }}
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>{t('lb_location')}</Form.Label>
              <Form.Control
                {...register('location', {
                  required: false,
                })}
                placeholder=""
                type="text"
                style={{ textAlign: 'right' }}
                onFocus={(e) => {
                  // 在获得焦点时全选输入框中的内容
                  e.target.select();
                }}
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label className="custom-control custom-checkbox custom-control-md">
                {t('lb_active')}
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
              </Form.Label>
            </Form.Group>
          </Form>
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
