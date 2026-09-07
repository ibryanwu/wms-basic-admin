import * as React from 'react';
import SelectPro from '../select';
import { AddBox, DeleteForever, Sort } from '@mui/icons-material';
import {
  Stack,
  Sheet,
  Box,
  Drawer,
  Button,
  DialogTitle,
  DialogContent,
  ModalClose,
  Divider,
  Grid,
  ButtonGroup,
} from '@mui/joy';
import { Alert, Col, Form, Row } from 'react-bootstrap';
//
import { Controller, useForm } from 'react-hook-form';
import { useGetAllUnits } from '@/rest/unit';
import {
  DECIMAL_GREATER_THAN_0,
  DECIMAL_GREATER_THAN_0_NULLABLE,
  DECIMAL_OR_0,
  NUMERIC_GREATER_OR_LESS_0,
} from '@/lib/constants';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useAtom } from 'jotai';
import {
  editItemAtom,
  itemListAtom,
  openPurItemDrawerAtom,
  pluPurHistoryAtom,
} from '@/stores/atom';
import Select from 'react-select';
import {
  IChangedValueForCaculate,
  IItem,
  ItotalAmount,
  PurItemDrawerFormData,
} from '@/types/purchase';
import {
  defaultPurItemsDrawerFormTotalAmountValue,
  defaultPurItemsDrawerFormValues,
} from '@/service/purchase';
import { generateShortUUID } from '@/utils/public';
import { useTranslation } from 'react-i18next';

export default function EditPurchaseOrderItemsDrawer(props: any) {
  const { t } = useTranslation('purchase_order');
  const { allItemsOptions, calculate } = props;
  const [itemListDatas, setItemListDatas] = useAtom(itemListAtom);
  const [editingItem, setEditingItem] = useAtom(editItemAtom);
  const [openPurItemDrawer, setOpenPurItemDrawer] = useAtom(
    openPurItemDrawerAtom,
  );

  // UseState ----------------------------------------------------------------
  const [formStatus, setFormStatus] = React.useState<string>('create'); // 判断是Create还是update
  const [selectedItem, setSelectedItem] = React.useState<any>(); //选中的Item 编辑态需要初始化
  const [totalAmount, setTotalAmount] = React.useState<ItotalAmount>(
    defaultPurItemsDrawerFormTotalAmountValue,
  ); //总价对象，编辑态需要初始化
  const [isDuplicate, setIsDuplicate] = React.useState<{
    check: boolean;
    row?: number;
  }>({
    check: false,
  });
  const display = React.useRef('none');

  // Hooks ------------------------------------------------
  const { options: unitOptions, data } = useGetAllUnits({ isActive: true });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    getValues,
  } = useForm<PurItemDrawerFormData>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultPurItemsDrawerFormValues as any,
  });
  // Use Effect--------------------------------------------------------
  // 打开时初始化
  useEffect(() => {
    if (openPurItemDrawer && Object.keys(editingItem).length === 0) {
      // @ts-ignore
      reset(defaultPurItemsDrawerFormValues);
      setSelectedItem(undefined);
      setFormStatus('create');
    }
    if (openPurItemDrawer && Object.keys(editingItem).length > 0) {
      setFormStatus('update');
    }

    if (!openPurItemDrawer) {
      setEditingItem({});
      setFormStatus('create');
      //关闭 进行计算
      calculate();
    }
    setIsDuplicate({
      check: false,
    });

    setTotalAmount(editingItem.total);
  }, [openPurItemDrawer]);

  // 编辑态时的初始化数据
  useEffect(() => {
    if (Object.keys(editingItem).length > 0) {
      let value = {
        item: editingItem.item,
        base_unit_id: editingItem.base_unit_id,
        pur_unit_id: editingItem.pur_unit_id,
        exchange_rate: editingItem.exchange_rate,
        tax_rate: editingItem.tax_rate,
        qty_pur: editingItem.qty_pur,
        price_pur: editingItem.price_pur,
        received_qty: editingItem.received_qty,
        qty_base: editingItem.qty_base,
        price_base: editingItem.price_base,
        is_partial_received: editingItem.is_partial_received,
        remark: editingItem.remark,
        is_promotional_item: false,
        //promotional_source_items: [],
        row_uuid: editingItem.row_uuid,
        sort_index: editingItem.sort_index,
      };
      reset(value);
      // 重置items下方的辅助参考信息
      setSelectedItem(editingItem.item);

      // 重置总价
      setTotalAmount(editingItem.total);
    }
  }, [editingItem]);

  useEffect(() => {
    if (formStatus === 'save') {
      clearForm();
      setOpenPurItemDrawer(false);
    } else if (formStatus === 'saveandcreate') {
      clearForm();
    }
  }, [formStatus]);

  //Function ----------------------------------------------------------------

  // ClearForm
  const clearForm = () => {
    // @ts-ignore
    reset(defaultPurItemsDrawerFormValues);
    setSelectedItem(undefined);
    setFormStatus('create');
    setEditingItem({});

    setTotalAmount(editingItem.total);
  };

  // Save
  const save = (data: PurItemDrawerFormData) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('save');
    }
  };
  // Save & Create
  const saveAndCreate = (data: PurItemDrawerFormData) => {
    if (checkBeforeSubmit(data)) {
      onSubmit(data);
      setFormStatus('saveandcreate');
    }
  };

  //自定义查询  返回boolean类型
  //searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
  const customFilter = (option: any, inputValue: any) => {
    if (inputValue.length > 2) {
      const searchFields = [option.data.search];
      return searchFields.some((field) => {
        const keywords = inputValue.split('|');
        // 检查是否同时包含两个关键字

        const containsMutliKeywords = keywords.every((keyword: any) =>
          field
            .toLowerCase()
            .replace(/\s/g, '')
            .includes(keyword.toLowerCase().replace(/\s/g, '')),
        );

        return containsMutliKeywords;
      });
    }
    return false; //禁止一上来就显示下拉
  };

  // isDuplicate
  const checkDulicate = (data: IItem) => {
    const res = itemListDatas.filter((item: any) => {
      return item.value === data.id;
    });

    if (res.length > 0) {
      const index = itemListDatas.findIndex(
        (item) => item.value === res[0].value,
      );
      setIsDuplicate({
        check: true,
        row: index + 1,
      });
    } else {
      setIsDuplicate({
        check: false,
      });
    }
  };

  const checkBeforeSubmit = (data: PurItemDrawerFormData) => {
    let errorMsg = '';
    errorMsg += !data.item ? '[ITEM] & ' : '';
    errorMsg += !data.base_unit_id ? '[Base Unit] &' : '';
    errorMsg += !data.pur_unit_id ? '[Pur Unit] ' : '';

    if (errorMsg !== '') {
      toast.error(`Please Select ${errorMsg}`, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      return false;
    }
    return true;
  };

  // Submit
  const onSubmit = (data: PurItemDrawerFormData) => {
    let tempData = [...itemListDatas];

    const dataFormat = {
      ...data,
      value: data.item.value,
      label: data.item.label,
      search: data.item.search,
      total: { ...totalAmount },
    };

    // 判断是Create还是Update================================ Start
    // 如果formStatus是create
    if (formStatus === 'create') {
      //获取行排序索引最大值
      let maxA = 0;
      if (tempData.length > 0) {
        maxA = Math.max(...tempData.map((obj) => obj.sort_index)) + 1;
      }
      ////////////////////////////////////////////////////////////////
      tempData.push({
        ...dataFormat,
        row_uuid: generateShortUUID(),
        sort_index: maxA,
      });
    } // 如果是formStatus是update
    else if (formStatus === 'update') {
      // 找到位置
      const index = editingItem.index;
      tempData[index] = {};
      tempData[index] = { ...editingItem, ...dataFormat };
    }

    // 判断是Create还是Update================================ End
    setItemListDatas([...tempData]);
  };

  const getFormValuesForCaculate = () => {
    return {
      exchange_rate: getValues('exchange_rate'),
      tax_rate: getValues('tax_rate'),
      qty_pur: getValues('qty_pur'),
      price_pur: getValues('price_pur'),
      received_qty: getValues('received_qty'),
      qty_base: getValues('qty_base'),
      price_base: getValues('price_base'),
    };
  };

  // 字段变化时计算价格
  const caculate = (data: IChangedValueForCaculate) => {
    //
    const { exchange_rate, tax_rate, qty_pur, price_pur } = data;

    var pPattern = DECIMAL_GREATER_THAN_0;
    var pPatternTax = DECIMAL_OR_0;
    var pPatternQty = NUMERIC_GREATER_OR_LESS_0;

    if (
      pPattern.test(exchange_rate) &&
      pPatternQty.test(qty_pur) &&
      pPattern.test(price_pur) &&
      pPatternTax.test(tax_rate)
    ) {
      let qty_base = 0;
      let price_base = 0;
      if (exchange_rate && parseFloat(exchange_rate) !== 0) {
        price_base = parseFloat(price_pur) / parseFloat(exchange_rate);
        qty_base = parseFloat(qty_pur) * parseFloat(exchange_rate);
      }

      setValue('qty_base', qty_base);
      setValue('price_base', parseFloat(price_base.toFixed(2)));
      //计算总价----------------------------------------------------------------
      let taxRate = parseFloat(tax_rate);
      let subtotal = parseFloat(qty_pur) * parseFloat(price_pur);
      let tax = subtotal * taxRate * 0.01;
      let total = subtotal + tax;

      setTotalAmount({
        taxRate,
        subtotal,
        tax,
        total,
      });
    }
  };

  return (
    <React.Fragment>
      <ToastContainer />
      <ButtonGroup>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<AddBox />}
          onClick={() => {
            setEditingItem({});
            // @ts-ignore
            reset(defaultPurItemsDrawerFormValues);
            setOpenPurItemDrawer(true);
          }}
        >
          {t('drawer_add_item')}
        </Button>
        {/* <Button
          variant="outlined"
          color="neutral"
          startDecorator={<DeleteForever />}
          onClick={() => {
            setItemListDatas([]);
          }}
        >
          Delete All Items
        </Button> */}
      </ButtonGroup>

      <Drawer
        anchor="right"
        size="lg"
        variant="plain"
        open={openPurItemDrawer}
        onClose={(_, reason) => {
          if (reason && reason === 'backdropClick') {
            return false;
          }

          setOpenPurItemDrawer(false);
        }}
        slotProps={{
          content: {
            sx: {
              bgcolor: 'transparent',
              p: { md: 3, sm: 0 },
              boxShadow: 'none',
            },
          },
        }}
      >
        <Form className="ht-100p" onSubmit={handleSubmit(save)}>
          <Sheet
            sx={{
              borderRadius: 'md',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
              overflow: 'auto',
            }}
          >
            <DialogTitle>
              {formStatus === 'create' ? (
                t('drawer_add_item')
              ) : (
                <>
                  {t('drawer_edit_item')} -
                  <span className="tx-gray-300">{editingItem.row_uuid}</span>
                </>
              )}
            </DialogTitle>
            <ModalClose />

            <DialogContent>
              <div className="pd-l-4 pd-r-4">
                <Grid container spacing={1}>
                  <Grid xs={12} md={10}>
                    <Form.Group className="form-group ">
                      <Form.Label>
                        *Items
                        {isDuplicate.check && (
                          <span className="bg-danger mg-l-10 text-light pd-l-10 pd-r-10">
                            <strong>Heads up!</strong> I found a duplicate item
                            {t('drawer_duplicate_row')} {isDuplicate.row}
                          </span>
                        )}
                      </Form.Label>
                      {allItemsOptions && (
                        <div>
                          <Controller
                            key="item"
                            name="item"
                            control={control}
                            render={({ field }) => (
                              <Select
                                className=""
                                value={field.value}
                                // rules={{ required: 'Username is required' }}
                                onChange={(value: any) => {
                                  
                                  // @ts-ignore
                                  checkDulicate(value);
                                  field.onChange(value);
                                  setSelectedItem(value);
                                  setValue('pur_unit_id', {
                                    value: value.pur_unit.id,
                                    name: value.pur_unit.name,
                                    label: value.pur_unit.name,
                                  });
                                  setValue('base_unit_id', {
                                    value: value.pur_unit.id,
                                    name: value.pur_unit.name,
                                    label: value.pur_unit.name,
                                  });
                                  setValue('exchange_rate', 1);
                                  setValue('tax_rate', value.tax_rate);
                                }}
                                options={allItemsOptions}
                                isMulti={false}
                                // @ts-ignore
                                rules={{ required: 'Item is required' }}
                                filterOption={customFilter}
                              />
                            )}
                          />
                        </div>
                      )}
                      {selectedItem && (
                        <div
                          style={{
                            textTransform: 'capitalize',
                            color: 'green',
                          }}
                        >
                          <Row>
                            <Col>barcode:{selectedItem.barcode}</Col>
                            <Col>Spec:{selectedItem.spec}</Col>
                          </Row>
                          <Row></Row>
                        </div>
                      )}
                    </Form.Group>
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  <Grid xs={6} md={2}>
                    <Form.Group className="form-group">
                      <Form.Label>{t('drawer_lb_pur_unit')}</Form.Label>
                      {unitOptions && (
                        <SelectPro
                          key="pur_unit_id"
                          name="pur_unit_id"
                          control={control}
                          defaultValue={undefined}
                          options={unitOptions}
                          isMulti={false}
                          rules={{ required: 'Pur Unit is required' }}
                          filterOption={undefined}
                          isDisabled={false}
                          onChangeHandler={(value: any) => {
                            setValue('base_unit_id', value);
                            setValue('exchange_rate', 1);
                          }}
                        />
                      )}
                    </Form.Group>
                  </Grid>
                  <div style={{ display: display.current }}>
                    <Grid xs={6} md={2}>
                      <Form.Group className="form-group">
                        <Form.Label>{t('drawer_lb_base_unit')}</Form.Label>
                        {unitOptions && (
                          <SelectPro
                            key="base_unit_id"
                            name="base_unit_id"
                            control={control}
                            defaultValue={undefined}
                            options={unitOptions}
                            isMulti={false}
                            rules={{ required: 'Base Unit is required' }}
                            filterOption={undefined}
                            isDisabled={false}
                            onChangeHandler={undefined}
                          />
                        )}
                        {errors.base_unit_id && (
                          <Form.Text className="text-danger">
                            {errors.base_unit_id.message as string}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Grid>
                  </div>
                  <div style={{ display: display.current }}>
                    <Grid md={2}>
                      <Form.Group className="form-group">
                        <Form.Label>{t('drawer_lb_exchange_rate')}</Form.Label>
                        <Form.Control
                          {...register('exchange_rate', {
                            required: true,
                            validate: (value: any): any => {
                              var pPattern = DECIMAL_GREATER_THAN_0_NULLABLE;

                              if (!pPattern.test(value)) {
                                return 'Value must be a number and <> 0';
                              }
                            },
                          })}
                          placeholder="ExchangeRate"
                          type="text"
                          style={{ textAlign: 'right' }}
                          onChange={(val) => {
                            const data = getFormValuesForCaculate();
                            // @ts-ignore
                            data.exchange_rate = val.target.value;
                            // @ts-ignore
                            caculate(data);
                          }}
                          onFocus={(e) => {
                            // 在获得焦点时全选输入框中的内容
                            e.target.select();
                          }}
                        />
                        {errors.exchange_rate && (
                          <Form.Text className="text-danger">
                            {errors.exchange_rate.message as string}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Grid>
                  </div>
                  <Grid md={2}>
                    <Form.Group className="form-group">
                      <Form.Label>{t('drawer_lb_tax_rate')}</Form.Label>
                      <Form.Control
                        {...register('tax_rate', {
                          required: false,
                          validate: (value: any): any => {
                            var pPattern = DECIMAL_GREATER_THAN_0_NULLABLE;

                            if (!pPattern.test(value)) {
                              return 'Value must be a number and <> 0';
                            }
                          },
                        })}
                        placeholder="Tax Rate"
                        type="text"
                        style={{ textAlign: 'right' }}
                        onChange={(val) => {
                          const data = getFormValuesForCaculate();
                          // @ts-ignore
                          data.tax_rate = val.target.value;
                          // @ts-ignore
                          caculate(data);
                        }}
                        onFocus={(e) => {
                          // 在获得焦点时全选输入框中的内容
                          e.target.select();
                        }}
                      />
                    </Form.Group>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid md={2}>
                    <Form.Group className="form-group">
                      <Form.Label>{t('drawer_lb_pur_qty')}</Form.Label>
                      <Form.Control
                        {...register('qty_pur', {
                          required: true,
                          validate: (value: any): any => {
                            
                            var pPattern = NUMERIC_GREATER_OR_LESS_0;

                            if (!pPattern.test(value)) {
                              return 'Value must be a number and <> 0';
                            }
                          },
                        })}
                        placeholder="price"
                        defaultValue={0}
                        type="text"
                        style={{ textAlign: 'right' }}
                        onChange={(val) => {
                          const data = getFormValuesForCaculate();
                          // @ts-ignore
                          data.qty_pur = val.target.value;
                          // @ts-ignore
                          caculate(data);
                          // @ts-ignore
                          setValue('received_qty', val.target.value);
                        }}
                        onFocus={(e) => {
                          // 在获得焦点时全选输入框中的内容
                          e.target.select();
                        }}
                      />
                      {errors.qty_pur && (
                        <Form.Text className="text-danger">
                          {errors.qty_pur.message as string}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Grid>
                  <Grid md={2}>
                    <Form.Group className="form-group">
                      <Form.Label>{t('drawer_lb_pur_price')}</Form.Label>
                      <Form.Control
                        {...register('price_pur', {
                          required: true,
                          validate: (value: any): any => {
                            var pPattern = DECIMAL_GREATER_THAN_0_NULLABLE;

                            if (!pPattern.test(value)) {
                              return 'Value must be a number > 0';
                            }
                          },
                        })}
                        defaultValue={0}
                        type="text"
                        style={{ textAlign: 'right' }}
                        onChange={(val) => {
                          const data = getFormValuesForCaculate();
                          // @ts-ignore
                          data.price_pur = val.target.value;
                          // @ts-ignore
                          caculate(data);
                        }}
                        onFocus={(e) => {
                          // 在获得焦点时全选输入框中的内容
                          e.target.select();
                        }}
                      />
                      {errors.price_pur && (
                        <Form.Text className="text-danger">
                          {errors.price_pur.message as string}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Grid>
                  <div style={{ display: display.current }}>
                    <Grid md={2}>
                      <Form.Group className="form-group">
                        <Form.Label>{t('drawer_lb_base_qty')}</Form.Label>
                        <Form.Control
                          {...register('qty_base', {
                            required: true,
                            validate: (value: any): any => {
                              var pPattern = NUMERIC_GREATER_OR_LESS_0;

                              if (!pPattern.test(value)) {
                                return 'Value must be a number > 0';
                              }
                            },
                          })}
                          defaultValue={0}
                          type="text"
                          style={{ textAlign: 'right' }}
                          onFocus={(e) => {
                            // 在获得焦点时全选输入框中的内容
                            e.target.select();
                          }}
                        />
                        {errors.qty_base && (
                          <Form.Text className="text-danger">
                            {errors.qty_base.message as string}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Grid>
                    <Grid md={2}>
                      <Form.Group className="form-group">
                        <Form.Label>{t('drawer_lb_base_price')}</Form.Label>
                        <Form.Control
                          {...register('price_base', {
                            required: true,
                            validate: (value: any): any => {
                              var pPattern = DECIMAL_GREATER_THAN_0_NULLABLE;

                              if (!pPattern.test(value)) {
                                return 'Value must be > 0';
                              }
                            },
                          })}
                          defaultValue={0}
                          type="text"
                          style={{ textAlign: 'right' }}
                          onFocus={(e) => {
                            // 在获得焦点时全选输入框中的内容
                            e.target.select();
                          }}
                        />
                        {errors.price_base && (
                          <Form.Text className="text-danger">
                            {errors.price_base.message as string}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Grid>
                  </div>
                  <Grid md={2}>
                    <Form.Group className="form-group">
                      <Form.Label>{t('drawer_lb_received_qty')}</Form.Label>
                      <Form.Control
                        {...register('received_qty', {
                          required: true,
                          validate: (value: any): any => {
                            var pPattern = NUMERIC_GREATER_OR_LESS_0;

                            if (!pPattern.test(value)) {
                              return 'Value must be a number > 0';
                            }
                          },
                        })}
                        placeholder="received_qty"
                        type="text"
                        style={{ textAlign: 'right' }}
                        onFocus={(e) => {
                          // 在获得焦点时全选输入框中的内容
                          e.target.select();
                        }}
                      />
                      {errors.received_qty && (
                        <Form.Text className="text-danger">
                          {errors.received_qty.message as string}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Grid>
                  <Grid md={2}>
                    <Form.Group className="form-group">
                      {totalAmount && (
                        <>
                          <Form.Label>
                            <div className="d-flex flex-row-reverse">
                              <span>
                                SubTotal:
                                <span
                                  className={`mg-l-6 ${
                                    totalAmount.total > 0 ? '' : 'text-danger'
                                  }`}
                                >
                                  {totalAmount.subtotal.toFixed(2)}
                                </span>
                              </span>
                            </div>
                            <div className="d-flex flex-row-reverse">
                              <span>
                                Tax:
                                <span
                                  className={`mg-l-6 ${
                                    totalAmount.total > 0 ? '' : 'text-danger'
                                  }`}
                                >
                                  {totalAmount.tax.toFixed(2)}
                                </span>
                              </span>
                            </div>
                          </Form.Label>
                          <div className="d-flex flex-row-reverse">
                            <span>
                              RowTotal:
                              <span
                                className={`mg-l-6 ${
                                  totalAmount.total > 0 ? '' : 'text-danger'
                                }`}
                              >
                                {totalAmount.total.toFixed(2)}
                              </span>
                            </span>
                          </div>
                        </>
                      )}
                    </Form.Group>
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  <div style={{ display: display.current }}>
                    <Grid md={2}>
                      <Form.Group className="form-group ">
                        <Form.Label className="custom-control custom-checkbox custom-control-md">
                          <Form.Control
                            {...register('is_partial_received')}
                            type="checkbox"
                            className="custom-control-input"
                          />
                          <span className="custom-control-label custom-control-label-md  tx-17">
                            {t('drawer_lb_partial_received')}
                          </span>
                        </Form.Label>
                      </Form.Group>
                    </Grid>
                  </div>

                  <Grid md={10}>
                    <Form.Group className="form-group">
                      <Form.Control
                        // @ts-ignore
                        {...register('remark', {
                          required: false,
                        })}
                        placeholder="Remark"
                        type="text"
                        style={{ textAlign: 'left' }}
                      />
                    </Form.Group>
                  </Grid>
                </Grid>
              </div>
            </DialogContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              useFlexGap
              spacing={1}
            >
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  clearForm();
                  setOpenPurItemDrawer(false);
                }}
              >
                {t('drawer_bt_cancel')}
              </Button>
              <Stack direction="row" gap={3}>
                <Button
                  variant="solid"
                  color="success"
                  onClick={handleSubmit(saveAndCreate)}
                >
                  {t('drawer_bt_save_create')}
                </Button>

                <Button className="mg-l-6" type="submit">
                  {t('bt_save')}
                </Button>
              </Stack>
            </Stack>
          </Sheet>
        </Form>
      </Drawer>
    </React.Fragment>
  );
}
