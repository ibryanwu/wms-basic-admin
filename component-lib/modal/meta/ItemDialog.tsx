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
import Select from 'react-select';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { defaultItemFormValues } from '@/service/meta';
import { IItem } from '@/types/items';
import { ToastContainer, toast } from 'react-toastify';
import { useCreateItem, useUpdateItem } from '@/rest/items';
import { useAtom } from 'jotai';
import { openItemModalAtom, openVendorModalAtom } from '@/stores/atom';
import { useGetAllUnits } from '@/rest/unit';
import { toastOptions } from '@/utils/public';
import { useGetCategory } from '@/rest/category';
import { DECIMAL_GREATER_EQUAL_0_NULLABLE } from '@/lib/constants';
import { useGetAllVendors } from '@/rest/vendor';
import SelectPro from '../../../component-lib/select';
import { useTranslation } from 'react-i18next';

export function ItemDialog(prop: any) {
  const { editingItem, showAddBt, setEditItem } = prop; //编辑时用来初始化数据的

  const handleClose = () => setOpenItemModal(false);
  const handleShow = () => setOpenItemModal(true);

  // Values  -------------------------------------------------

  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [show, setOpenItemModal] = useAtom(openItemModalAtom);
  // UseState  -----------------------------------------------
  const [formStatus, setFormStatus] = React.useState<string>('create'); // 判断是Create还是update

  // UseForm  ------------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    getValues,
  } = useForm<any>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultItemFormValues as any,
  });
  // Hooks  --------------------------------------------------
  const { t } = useTranslation('items'); // 加载 xxx.json 翻译文件
  const { t: t0 } = useTranslation('common'); // 加载 xxx.json 翻译文件
  const { options: unitOptions } = useGetAllUnits({ isActive: true });
  const { options: categoryData } = useGetCategory({ isActive: true });
  const { data: vendorsData, refetch: refetchVendor } = useGetAllVendors({
    type: 1,
    isActive: true,
    isOnlyOwnItem: true,
  });
  const {
    mutate: update,
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    serverError: updateError,
  } = useUpdateItem();
  const {
    mutate: create,
    data: dataCreate,
    isLoading: isLoadingCreate,
    serverError: createError,
  } = useCreateItem();

  // Use Effect  ---------------------------------------------
  // 编辑态时的初始化数据
  // 打开时初始化
  useEffect(() => {
    if (show && !editingItem) {
      // @ts-ignore
      reset(defaultItemFormValues);
      setFormStatus('create');
      if (setEditItem) {
        setEditItem(undefined);
      }
    }
    if (show && editingItem && Object.keys(editingItem).length > 0) {
      editingItem.name_en = editingItem.name_localizations.en;
      editingItem.category = {
        value: editingItem.category.id,
        label: editingItem.category.name,
      };
      editingItem.base_unit = {
        value: editingItem.base_unit.id,
        label: editingItem.base_unit.name,
      };
      if (editingItem.case_unit) {
        editingItem.case_unit = {
          value: editingItem.case_unit.id,
          label: editingItem.case_unit.name,
        };
      }
      if (editingItem.vendor) {
        editingItem.vendor = {
          value: editingItem.vendor.id,
          label: editingItem.vendor.name,
        };
      }

      editingItem.is_available = editingItem.is_available;
      reset(editingItem);

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
    }
    if (dataCreate && dataCreate?.code > 0) {
      toast.error(`Save failed  ${dataCreate.data}`, toastOptions);
    }
    if (createError) {
      toast.error(createError, toastOptions);
    }
    setOpenItemModal(false);
  }, [dataCreate, createError]);

  useEffect(() => {
    if (dataUpdate?.code === 0) {
      toast.success(`Save successfully`, toastOptions);
      setEditItem(undefined);
    }
    if (dataUpdate && dataUpdate?.code > 0) {
      toast.error(`Save failed ${dataUpdate.data}`, toastOptions);
    }
    if (updateError) {
      toast.error(updateError, toastOptions);
    }
    setOpenItemModal(false);
  }, [dataUpdate, updateError]);

  // Function ------------------------------------------------
  const checkBeforeSubmit = (data: IItem) => {
    let errorMsg = '';

    if (!data.base_unit) {
      errorMsg += 'Base unit is required,';
    }
    // if (!data.sku || data.sku === '') {
    //   errorMsg += 'SKU is required,';
    // }

    if (errorMsg !== '') {
      toast.error(`Error! ${errorMsg}`, toastOptions);
      return false;
    }
    return true;
  };
  // Save
  const save = (data: IItem) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('save');
    }
  };

  // Submit
  const onSubmit = (formData: IItem) => {
    const newData = { ...formData };
    newData.plu = formData.sku || undefined;
    newData.upc = formData.upc || undefined;
    newData.vendor_id = formData.vendor?.value || undefined;
    newData.base_unit_id = formData.base_unit?.value || undefined;
    newData.case_unit_id =
      formData.case_unit?.value || formData.base_unit?.value;
    newData.category_id = formData.category?.value || undefined;
    newData.minimum_inventory = formData.minimum_inventory
      ? parseFloat(formData.minimum_inventory as string)
      : 0;
    newData.tax_rate = formData.tax_rate
      ? parseFloat(formData.tax_rate as string)
      : 0;
    newData.tax_amount = formData.tax_amount
      ? parseFloat(formData.tax_amount as string)
      : 0;
    newData.case_exchange_rate = formData.case_exchange_rate
      ? parseFloat(formData.case_exchange_rate as string)
      : 0;
    //
    const { id, base_unit, case_unit, category, plu, ...updateFormatData } =
      newData;
    //
    if (formStatus === 'create' && formData) {
      create(updateFormatData as IItem);
    }
    //
    if (formStatus === 'update' && formData)
      update({ id: id as string, data: updateFormatData as IItem });
  };

  return (
    <>
      <ToastContainer />
      {showAddBt && (
        <Button variant="primary" onClick={handleShow}>
          <i className="fe fe-plus me-2"></i>
          Add Item
        </Button>
      )}

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header>
          <Modal.Title>Items - {formStatus}</Modal.Title>
          <Button variant="" onClick={handleClose}>
            X
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(save)}>
            <Form.Group className="form-group">
              <Form.Label>{t('form_lb_name')}</Form.Label>
              <Form.Control
                autoFocus
                {...register('name_en', {
                  required: true,
                })}
                placeholder="Name(En)"
                type="text"
              />
              {errors.name_en && (
                <Form.Text className="text-danger">
                  {errors.name_en.message as string}
                </Form.Text>
              )}
            </Form.Group>

            <Grid container spacing={1}>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('form_lb_category')}</Form.Label>
                  <div>
                    <Controller
                      key="category"
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className=""
                          value={field.value}
                          // rules={{ required: 'Username is required' }}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          options={
                            categoryData && Array.isArray(categoryData)
                              ? categoryData
                              : []
                          }
                          isMulti={false}
                          // @ts-ignore
                          rules={{ required: 'Required' }}
                        />
                      )}
                    />
                  </div>
                </Form.Group>
              </Grid>

              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('form_lb_spec')}Spec</Form.Label>
                  <Form.Control
                    {...register('spec', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('form_lb_min_inv')}</Form.Label>
                  <Form.Control
                    {...register('minimum_inventory', {
                      required: false,
                      validate: (value: any): any => {
                        var pPattern = DECIMAL_GREATER_EQUAL_0_NULLABLE;

                        if (!pPattern.test(value)) {
                          return 'Value must be a number >= 0';
                        }
                      },
                    })}
                    placeholder=""
                    type="test"
                  />
                  {errors.minimum_inventory && (
                    <Form.Text className="text-danger">
                      {errors.minimum_inventory.message as string}
                    </Form.Text>
                  )}
                </Form.Group>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>SKU</Form.Label>
                  <Form.Control
                    {...register('sku', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
                {errors.sku && (
                  <Form.Text className="text-danger">
                    {errors.sku.message as string}
                  </Form.Text>
                )}
              </Grid>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>UPC</Form.Label>
                  <Form.Control
                    {...register('upc', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
                {errors.upc && (
                  <Form.Text className="text-danger">
                    {errors.upc.message as string}
                  </Form.Text>
                )}
              </Grid>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>Barcode</Form.Label>
                  <Form.Control
                    {...register('barcode', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>{t('form_lb_vendor_sku')}</Form.Label>
                  <Form.Control
                    {...register('vendor_sku', {
                      required: false,
                    })}
                    placeholder=""
                    type="text"
                  />
                </Form.Group>
              </Grid>
              <Grid xs={12} md={4}>
                <Form.Group className="form-group">
                  <Form.Label>
                    <span>{t('form_lb_vendor_owned')}</span>
                  </Form.Label>
                  <>
                    {vendorsData?.data && (
                      <div style={{ zIndex: 892 }}>
                        <SelectPro
                          key="vendor"
                          name="vendor"
                          control={control}
                          defaultValue={undefined}
                          options={vendorsData.data}
                          isMulti={false}
                          filterOption={undefined}
                          isDisabled={false}
                          //isDisabled={itemListDatas?.length > 0}
                        />
                      </div>
                    )}
                  </>
                </Form.Group>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid xs={6} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>{t('form_lb_base_unit')}</Form.Label>
                  <div>
                    <Controller
                      key="base_unit"
                      name="base_unit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className=""
                          value={field.value}
                          // rules={{ required: 'Username is required' }}
                          onChange={(value) => {
                            field.onChange(value);

                            setValue('case_unit', { ...value });
                          }}
                          options={unitOptions}
                          isMulti={false}
                          // @ts-ignore
                          rules={{ required: 'Required' }}
                        />
                      )}
                    />
                  </div>
                </Form.Group>
              </Grid>
              <Grid xs={6} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>
                    {t('form_lb_cse_unit')}
                    {`(Case,Box,Package...)`}
                  </Form.Label>
                  <div>
                    <Controller
                      key="case_unit"
                      name="case_unit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className=""
                          value={field.value}
                          // rules={{ required: 'Username is required' }}
                          onChange={(value) => {
                            field.onChange(value);

                            setValue('case_unit', { ...value });
                          }}
                          options={unitOptions}
                          isMulti={false}
                          // @ts-ignore
                          rules={{ required: 'Required' }}
                        />
                      )}
                    />
                  </div>
                </Form.Group>
              </Grid>
              <div style={{ display: 'none' }}>
                <Grid xs={12} md={6}>
                  <Form.Group className="form-group">
                    <Form.Label>Pur Unit</Form.Label>
                    <div>
                      <Controller
                        key="case_unit"
                        name="case_unit"
                        control={control}
                        render={({ field }) => (
                          <Select
                            className=""
                            value={field.value}
                            // rules={{ required: 'Username is required' }}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            options={unitOptions}
                            isMulti={false}
                            // @ts-ignore
                            rules={{}}
                          />
                        )}
                      />
                    </div>
                  </Form.Group>
                </Grid>
              </div>
            </Grid>

            <Form.Group className="form-group">
              <Form.Label>{t0('form_lb_remarks')}</Form.Label>
              <Form.Control
                {...register('remarks', {
                  required: false,
                })}
                placeholder=""
                type="text"
              />
            </Form.Group>

            <Grid xs={12} md={4}>
              <Form.Group className="form-group">
                <Stack direction="horizontal" className="mg-t-30">
                  <span>{t0('form_lb_active')}</span>
                  <Controller
                    key="is_available"
                    name="is_available"
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
              Saving...
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
