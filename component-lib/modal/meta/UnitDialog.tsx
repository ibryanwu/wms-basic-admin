import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Switch,
} from '@mui/material';
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { defaultUnitFormValues } from '@/service/meta';
import { IUnit } from '@/types/unit';
import { ToastContainer, toast } from 'react-toastify';
import { useCreateUnit, useUpdateUnit } from '@/rest/unit';
import { useAtom } from 'jotai';
import { openUnitModalAtom } from '@/stores/atom';
import { toastOptions } from '@/utils/public';
import { useTranslation } from 'react-i18next';

export function UnitDialog(prop: any) {
  const { t } = useTranslation('unit');
  const { t: t0 } = useTranslation('common');
  const { editingItem, showAddBt, setEditItem } = prop; //编辑时用来初始化数据的

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [show, setShow] = useAtom(openUnitModalAtom);
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
  } = useForm<IUnit>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultUnitFormValues as any,
  });
  // Hooks  --------------------------------------------------
  const {
    mutate: update,
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    serverError: updateError,
  } = useUpdateUnit();
  const {
    mutate: create,
    data: dataCreate,
    isLoading: isLoadingCreate,
    serverError: createError,
  } = useCreateUnit();
  // Use Effect  ---------------------------------------------
  // 编辑态时的初始化数据
  // 打开时初始化
  useEffect(() => {
    if (show && !editingItem) {
      // @ts-ignore
      reset(defaultUnitFormValues);
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
    if (dataUpdate?.code === 0) {
      toast.success(`Save unit successfully`, toastOptions);
      setEditItem(undefined);
    }
    if (dataUpdate && dataUpdate?.code > 0) {
      toast.error(`Save failed ${dataUpdate.data}`, toastOptions);
    }
    if (updateError) {
      toast.error(updateError, toastOptions);
    }
    setShow(false);
  }, [dataUpdate, updateError]);

  useEffect(() => {
    if (dataCreate?.code === 0) {
      toast.success(`Save unit successfully`, toastOptions);
      setEditItem(undefined);
    }
    if (dataCreate && dataCreate?.code > 0) {
      toast.error(`Save failed ${dataCreate.data}`, toastOptions);
    }
    if (createError) {
      toast.error(createError, toastOptions);
    }
    setShow(false);
  }, [dataCreate, createError]);

  // Function ------------------------------------------------
  const checkBeforeSubmit = (data: IUnit) => {
    let errorMsg = '';
    errorMsg += '';

    if (errorMsg !== '') {
      toast.error(`Please Select ${errorMsg}`, toastOptions);
      return false;
    }
    return true;
  };
  // Save
  const save = (data: IUnit) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('save');
    }
  };

  // Submit
  const onSubmit = (data: IUnit) => {
    if (formStatus === 'create' && data) create(data);
    if (formStatus === 'update' && data)
      update({ data, id: data.id as string });
  };

  return (
    <>
      {showAddBt && (
        <Button variant="primary" onClick={handleShow}>
          <i className="fe fe-plus me-2"></i>
          {t('add_unit')}
        </Button>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>
            {t('lb_unit')} - {formStatus}
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
              <Form.Label>{t('lb_remarks')}</Form.Label>
              <Form.Control
                {...register('remarks', {
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
