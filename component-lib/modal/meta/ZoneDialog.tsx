import { Switch } from '@mui/material';
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
import { defaultZoneFormValues } from '@/service/meta';
import { toast } from 'react-toastify';

import { useAtom } from 'jotai';
import { openZoneModalAtom, searchLocationAtom } from '@/stores/atom';
import { useCreateZone, useUpdateZone } from '@/rest/location';
import { toastOptions } from '@/utils/public';
import { IZone } from '@/types/location';
import { INT_GREATER_THAN_0 } from '@/lib/constants';
import { useTranslation } from 'react-i18next';

export function ZoneDialog(prop: any) {
  const { t } = useTranslation('vendor');
  const { t: t0 } = useTranslation('common');
  const { editingItem, showAddBt, setEditItem, warehouseId } = prop; //编辑时用来初始化数据的

  const handleClose = () => {
    setEditItem(undefined);
    setShow(false);
  };
  const handleShow = () => setShow(true);

  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [show, setShow] = useAtom(openZoneModalAtom);
  const [_, setSearch] = useAtom(searchLocationAtom);
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
  } = useForm<IZone>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultZoneFormValues as any,
  });
  // Hooks  --------------------------------------------------
  const {
    mutate: update,
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    serverError: updateError,
  } = useUpdateZone();
  const {
    mutate: create,
    data: dataCreate,
    isLoading: isLoadingCreate,
    serverError: createError,
  } = useCreateZone();
  // Use Effect  ---------------------------------------------
  // 编辑态时的初始化数据
  // 打开时初始化
  useEffect(() => {
    if (show && !editingItem) {
      // @ts-ignore
      reset(defaultZoneFormValues);
      setSelectedItem(undefined);
      setFormStatus('create');
      setEditItem(undefined);
    }
    if (show && editingItem && Object.keys(editingItem).length > 0) {
      reset(editingItem);
      // reset({ isActive: false });
      setFormStatus('update');
    }
  }, [show]);

  useEffect(() => {
    if (dataUpdate?.code === 0) {
      toast.success(`Save successfully`, toastOptions);
      setEditItem(undefined);
      setSearch(true);
      setShow(false);
    } else if (dataUpdate && dataUpdate?.code > 0) {
      toast.error(`Save failed ${dataUpdate.data}`, toastOptions);
      setShow(false);
    } else if (updateError) {
      toast.error(updateError, toastOptions);
      setShow(false);
    }
  }, [dataUpdate, updateError]);

  useEffect(() => {
    if (dataCreate?.code === 0) {
      toast.success(`Save successfully`, toastOptions);
      setEditItem(undefined);
      setSearch(true);
      setShow(false);
    } else if (dataCreate && dataCreate?.code > 0) {
      toast.error(`Save failed ${dataCreate.data}`, toastOptions);
      setShow(false);
    } else if (createError) {
      toast.error(createError, toastOptions);
      setShow(false);
    }
  }, [dataCreate, createError]);

  // Function ------------------------------------------------
  const checkBeforeSubmit = (data: IZone) => {
    let errorMsg = '';
    errorMsg += '';

    if (errorMsg !== '') {
      toast.error(`Please Select ${errorMsg}`, toastOptions);
      return false;
    }
    return true;
  };
  // Save
  const save = (data: IZone) => {
    if (checkBeforeSubmit(data)) {
      data.warehouseId = warehouseId;
      data.capacity = data.capacity
        ? parseInt(data.capacity.toString(), 10)
        : 0;
      onSubmit(data);
      setFormStatus('save');
    }
  };

  // Submit
  const onSubmit = (data: IZone) => {
    if (formStatus === 'create' && data) create(data);
    if (formStatus === 'update' && data)
      update({ data, id: data.id as string });
  };

  return (
    <>
      {showAddBt && warehouseId && (
        <Button
          variant="link"
          onClick={() => {
            setEditItem(undefined);
            handleShow();
          }}
        >
          <i className="fe fe-plus me-2"></i>
          Add Zone
        </Button>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>
            Zone - {formStatus} - {warehouseId}
          </Modal.Title>
          <Button variant="" onClick={handleClose}>
            X{' '}
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(save)}>
            <Form.Group className="form-group">
              <Form.Label>Name</Form.Label>
              <Form.Control
                autoFocus
                {...register('name', {
                  required: true,
                })}
                placeholder="Name"
                type="text"
                style={{ textAlign: 'left' }}
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
              <Form.Label>Description</Form.Label>
              <Form.Control
                {...register('description', {
                  required: false,
                })}
                placeholder=""
                type="text"
                style={{ textAlign: 'left' }}
                onFocus={(e) => {
                  // 在获得焦点时全选输入框中的内容
                  e.target.select();
                }}
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Storage Type</Form.Label>
              <Form.Control
                {...register('storageType', {
                  required: false,
                })}
                placeholder=""
                type="text"
                style={{ textAlign: 'left' }}
                onFocus={(e) => {
                  // 在获得焦点时全选输入框中的内容
                  e.target.select();
                }}
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                {...register('capacity', {
                  required: true,
                  validate: (value: any): any => {
                    var pPattern = INT_GREATER_THAN_0;

                    if (!pPattern.test(value)) {
                      return 'Value must be a Integer and > 0';
                    }
                  },
                })}
                placeholder=""
                type="text"
                style={{ textAlign: 'left' }}
                onFocus={(e) => {
                  // 在获得焦点时全选输入框中的内容
                  e.target.select();
                }}
              />
              {errors.capacity && (
                <Form.Text className="text-danger">
                  {errors.capacity.message as string}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Location</Form.Label>
              <Form.Control
                {...register('location', {
                  required: false,
                })}
                placeholder=""
                type="text"
                style={{ textAlign: 'left' }}
                onFocus={(e) => {
                  // 在获得焦点时全选输入框中的内容
                  e.target.select();
                }}
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="custom-control custom-checkbox custom-control-md">
                Active
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
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit(save)}>
                Save
              </Button>
            </>
          ) : (
            <Button variant="primary" disabled={true}>
              Saving...
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
