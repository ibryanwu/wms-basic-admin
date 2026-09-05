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
import Select, { GroupBase, OptionsOrGroups } from 'react-select';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { defaultVendorFormValues } from '@/service/meta';
import { IVendor } from '@/types/vendor';
import { ToastContainer, toast } from 'react-toastify';
import { useCreateVendors, useUpdateVendors } from '@/rest/vendor';
import { useAtom } from 'jotai';
import { openVendorModalAtom } from '@/stores/atom';
import Link from 'next/link';
import { toastOptions } from '@/utils/public';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

export function VendorDialog(prop: any) {
  const { editingItem, showAddBt, setEditItem } = prop; //编辑时用来初始化数据的
  const { t } = useTranslation('vendor');
  const { t: t0 } = useTranslation('common');
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  type OptionType = {
    value: string;
    label: string;
  };
  // Values  -------------------------------------------------
  const options: OptionType[] = [
    { value: '1', label: 'Vendor' },
    { value: '2', label: 'Customer' },
    { value: '3', label: 'Vendor & Customer' },
  ];
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [show, setShow] = useAtom(openVendorModalAtom);
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
  } = useForm<IVendor>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultVendorFormValues as any,
  });
  // Hooks  --------------------------------------------------
  const {
    mutate: update,
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    serverError: updateError,
  } = useUpdateVendors();
  const {
    mutate: create,
    data: dataCreate,
    isLoading: isLoadingCreate,
    serverError: createError,
  } = useCreateVendors();
  // Use Effect  ---------------------------------------------
  // 编辑态时的初始化数据
  // 打开时初始化
  useEffect(() => {
    if (show && !editingItem) {
      // @ts-ignore
      reset(defaultVendorFormValues);
      setSelectedItem(undefined);
      setFormStatus('create');
      if (setEditItem) {
        setEditItem(undefined);
      }
    }
    if (show && editingItem && Object.keys(editingItem).length > 0) {
      editingItem.vendor_type_selected = {
        value: editingItem.vendor_type,
        label: options[editingItem.vendor_type - 1].label,
      };
      reset(editingItem);
      // reset({ isActive: false });
      setFormStatus('update');
    }
    if (!show && setEditItem) setEditItem(undefined);
  }, [show]);

  useEffect(() => {
    if (dataCreate?.code === 0) {
      toast.success(`Save successfully`, toastOptions);
      if (setEditItem) {
        setEditItem(undefined);
      }
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
  const checkBeforeSubmit = (data: IVendor) => {
    let errorMsg = '';
    if (!data.vendor_type_selected) errorMsg += 'please select vendor type';

    if (errorMsg !== '') {
      toast.error(`Please Select ${errorMsg}`, toastOptions);
      return false;
    }
    return true;
  };
  // Save
  const save = (data: IVendor) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('save');
    }
  };

  // Submit
  const onSubmit = (data: IVendor) => {
    data.vendor_type = data.vendor_type_selected.value
      ? parseInt(data.vendor_type_selected.value.toString())
      : 3;
    const { vendor_type_selected, email, ...newData } = data;

    if (_.isString(email) && !_.isEmpty(_.trim(email))) {
      data.email = email;
    }

    if (formStatus === 'create' && data) {
      create(newData as IVendor);
    }
    if (formStatus === 'update' && data) update({ id: data.id, data: data });
  };

  return (
    <>
      {showAddBt && (
        <Link className="btn ripple btn-primary" href="#!" onClick={handleShow}>
          <i className="fe fe-plus me-2"></i>
          Add Vendor & Customer
        </Link>
      )}

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header>
          <Modal.Title>
            {t('lb_vendor')} & {t('lb_customer')} - {formStatus}
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
              />
              {errors.name && (
                <Form.Text className="text-danger">
                  {errors.name.message as string}
                </Form.Text>
              )}
            </Form.Group>

            <Grid container spacing={1}>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_type')}</Form.Label>
                  <div>
                    <Controller
                      key="vendor_type_selected"
                      name="vendor_type_selected"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className=""
                          value={field.value}
                          // rules={{ required: 'Username is required' }}
                          onChange={(value) => {
                            field.onChange(value);
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
              <Grid xs={6} md={2}>
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
              <Grid xs={6} md={3}>
                <Form.Group className="form-group">
                  <Stack direction="horizontal" className="mg-t-30">
                    <span>{t('lb_private_item')}</span>
                    <Controller
                      key="isOnlyOwnItem"
                      name="isOnlyOwnItem"
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
            </Grid>

            <Grid container spacing={1}>
              <Grid xs={12} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_phone')}</Form.Label>
                  <Form.Control
                    {...register('phone', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
              <Grid xs={12} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_email')}</Form.Label>
                  <Form.Control
                    {...register('email', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
            </Grid>

            <Form.Group className="form-group">
              <Form.Label>{t('lb_address')}</Form.Label>
              <Form.Control
                {...register('address', {
                  required: false,
                })}
                placeholder=""
                type="text"
              />
            </Form.Group>
            <Grid container spacing={1}>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_city')}</Form.Label>
                  <Form.Control
                    {...register('city', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_province')}</Form.Label>
                  <Form.Control
                    {...register('province', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('lb_postal_code')}</Form.Label>
                  <Form.Control
                    {...register('postcode', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
            </Grid>

            <Form.Group className="form-group">
              <Form.Label>{t('lb_remarks')}</Form.Label>
              <Form.Control
                {...register('remarks', {
                  required: false,
                })}
                placeholder=""
                type="text"
              />
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
