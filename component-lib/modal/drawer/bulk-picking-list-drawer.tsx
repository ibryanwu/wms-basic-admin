import PickingListForOneOrder from '@/component-lib/data-table/picking/PickingListForOneOrderDt';
import { useToken } from '@/lib/hooks/use-token';
import { useGetPickingListData } from '@/rest/outbound';
import { sortPickingItemsByLocation } from '@/service/outbound';
import {
  openBulkPickingListDrawerAtom,
  openPickingListDrawerAtom,
} from '@/stores/atom';
import {
  Stack,
  Sheet,
  Box,
  Drawer,
  Button,
  DialogTitle,
  DialogContent,
  ModalClose,
  Badge,
  Divider,
  Grid,
  ButtonGroup,
  Input,
} from '@mui/joy';
import { Col, Row } from 'react-bootstrap';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DangerousIcon from '@mui/icons-material/Dangerous';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';
import { toast } from 'react-toastify';
import { toastOptions } from '@/utils/public';
import { useFinishOrder } from '@/rest/outbound';
import { useBulkConfirmPicked, useIsPicked } from '@/rest/inventory';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import PickingListForBulkOrder from '@/component-lib/data-table/picking/PickingListForBulkOrderDt';
import NumericInputPad from '@/component-lib/public/numeric-input-pad';
import { useTranslation } from 'react-i18next';

export default function BulkPickingListDrawer(props: any) {
  // Values  -------------------------------------------------
  const { data, setBulkPickingOrderIds, refetchOrder, refetchBulkPickingList } =
    props;

  const { summary, orders } = data;
  const { hasToken } = useToken();
  const routes = useRouter();
  // Auth ----------------------------------------------------
  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);
  // Atoms ---------------------------------------------------
  const [openBulkPickingListDrawer, setOpenBulkPickingListDrawer] = useAtom(
    openBulkPickingListDrawerAtom,
  );

  // UseState  -----------------------------------------------
  const [pickingItems, setPickingItems] = useState([]);
  const [pickedItems, setPickedItems] = useState([]);

  // input value
  const [pickedQty, setPickedQty] = useState('');
  const [shortQty, setShortQty] = useState('');

  // num inputPad
  const [inputPad, setInputPad] = useState(''); //picked short

  const [finishPickingModalShow, setFinishPickingModalShow] = useState(false);
  const [currentTab, setCurrentTab] = useState('unpicked'); //unpicked picked
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [locationCodeInput, setLocationCodeInput] = useState('');
  const [upcInput, setUPCInput] = useState('');
  const [upcCheck, setUPCCheck] = useState(0); // 0-初始 1-通过 2-失败 9-无需校验
  const [locationCodeCheck, setLocationCodeCheck] = useState(0); // 0-初始 1-通过 2-失败 9-无需校验

  //
  const upcInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { t } = useTranslation('picking_list');
  const {
    mutate: bulkConfirmPicked,
    data: bulkConfirmPickedRes,
    isLoading: isLoadingBulkConfirmPicked,
    serverError: bulkConfirmPickedError,
  } = useBulkConfirmPicked();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    if (!currentItem?.location) {
      setLocationCodeCheck(9);
    }
    if (!currentItem?.item.upc) {
      setUPCCheck(9);
    }
  }, [currentItem]);

  useEffect(() => {
    if (currentTab === 'picked') {
      setCurrentItem(null);
    }
  }, [currentTab]);

  useEffect(() => {
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (currentItem && pickedQty > currentItem.totalQuantity) {
      setPickedQty(currentItem.totalQuantity);
    } else if (currentItem) {
      setShortQty(
        String(Number(currentItem.totalQuantity) - Number(pickedQty)),
      );
    }
  }, [pickedQty]);

  useEffect(() => {
    if (summary) {
      const pickingItemsData = summary.filter(
        (item: any) =>
          Number(item.pickedQuantity) + Number(item.shortQuantity) !==
          Number(item.totalQuantity),
      );

      if (pickingItemsData.length === 0) {
        setCurrentTab('picked');
      } else {
        setCurrentItem(pickingItemsData[0]);
      }

      setPickingItems(pickingItemsData);
      setPickedItems(
        summary.filter(
          (item: any) =>
            Number(item.pickedQuantity) + Number(item.shortQuantity) ===
            Number(item.totalQuantity),
        ),
      );
    }
  }, [summary]);

  // useEffect(() => {
  //   if (finishOrderRes?.code === 0) {
  //     toast.success('Finish Successfully', toastOptions);
  //     refetchOrder();
  //     handleClose();
  //   } else if (finishOrderRes?.msg) {
  //     toast.error(`Finish failed:${finishOrderRes?.msg}`, toastOptions);
  //     refetchOrder();
  //     handleClose();
  //   }
  // }, [finishOrderRes]);

  useEffect(() => {
    if (bulkConfirmPickedRes?.code === 0) {
      refetchBulkPickingList();
      setCurrentItem(undefined);
      handleClear();
    }
  }, [bulkConfirmPickedRes]);

  // Function ------------------------------------------------

  const handleClose = () => {
    if (setBulkPickingOrderIds) {
      setBulkPickingOrderIds([]);
      setCurrentItem(undefined);
      setOpenBulkPickingListDrawer(false);
    }
  };

  const handleClear = () => {
    setLocationCodeInput('');
    setUPCInput('');
    setUPCCheck(0);
    setLocationCodeCheck(0);
  };

  //提取lock的id
  const extractLocksId = () => {
    const lockIds: string[] = [];
    if (currentItem && currentItem.locks.length > 0) {
      currentItem.locks.map((lock: any) => {
        lockIds.push(lock.id);
      });
    }
    return lockIds;
  };

  //处理完成拣货
  const handleFinishPicking = () => {
    if (
      (locationCodeCheck === 1 || locationCodeCheck === 9) &&
      (upcCheck === 1 || upcCheck === 9)
    ) {
      const totalQty = Number(pickedQty) + Number(shortQty);
      if (totalQty === currentItem.totalQuantity) {
        const lockIds = extractLocksId();
        bulkConfirmPicked({
          lockIds,
          pickedQty,
          shortQty,
          isForcePicked: true,
          totalQty: currentItem.totalQuantity,
        });
        setFinishPickingModalShow(false);
      } else {
        toast.error('Picked + Short must equel Total', toastOptions);
      }
    } else {
      toast.error('Please Scan Code First', toastOptions);
    }
  };

  return (
    <React.Fragment>
      <ConfirmModal
        key={3}
        show={finishPickingModalShow}
        setShow={setFinishPickingModalShow}
        fun={() => {
          handleFinishPicking();
          setFinishPickingModalShow(false);
        }}
        info={{
          title: t('md_confirm_finish_picking'),
          body:
            Number(shortQty) > 0 ? (
              <span style={{ color: 'red' }}>
                <span className="tx-24">Short - {shortQty} </span> <br />
                {t('md_confirm_finish_picking_body')}
              </span>
            ) : (
              <>{t('md_confirm_finish_picking_body')}</>
            ),
          buttonName:
            Number(shortQty) > 0 ? t('btn_force_finish') : t('btn_finish'),
        }}
      />
      <Drawer
        anchor="right"
        size="lg"
        // variant="plain"
        open={openBulkPickingListDrawer}
        onClose={(_, reason) => {
          handleClose();
        }}
      >
        <div className="ht-100p">
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
              {t('dtlb_bulk_picking')} {'['} {summary.length}-Items
              {']'}
            </DialogTitle>
            <ModalClose />
            {currentItem && (
              <div className=" p-2" style={{ backgroundColor: '#ffefd1' }}>
                <Stack gap={1}>
                  <div className=" pd-r-4 tx-18">
                    {currentItem?.item.name_localizations.en}
                  </div>
                  {currentItem?.location && (
                    <div>
                      <Row>
                        <Col xs={6}>
                          <Input
                            size="md"
                            slotProps={{
                              input: {
                                ref: locationInputRef,
                              },
                            }}
                            value={locationCodeInput} // 绑定状态到输入框
                            placeholder={t('lb_location_code')}
                            onFocus={() => setInputPad('')}
                            onChange={(e) =>
                              setLocationCodeInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const valueWithoutHyphen =
                                  currentItem.location.replace(/-/g, '');
                                if (valueWithoutHyphen === locationCodeInput) {
                                  setLocationCodeCheck(1);
                                } else {
                                  setLocationCodeCheck(2);
                                }
                                e.preventDefault(); // 阻止默认行为
                                if (upcInputRef.current) {
                                  upcInputRef.current.focus();
                                }
                              }
                            }}
                          />
                        </Col>
                        <Col xs={4} className="p-0">
                          <div className="mt-1">
                            <span
                              className={`bg-danger text-white  tx-22 p-1`}
                              style={{
                                borderRadius: '4px',
                              }}
                            >
                              {currentItem.location}
                            </span>
                            {locationCodeCheck === 1 ? (
                              <CheckCircleIcon sx={{ color: 'green' }} />
                            ) : locationCodeCheck === 2 ? (
                              <DangerousIcon sx={{ color: 'red' }} />
                            ) : null}
                          </div>
                        </Col>
                        <Col xs={2} className="p-0 "></Col>
                      </Row>
                    </div>
                  )}
                  {currentItem?.item.upc || currentItem?.item.sku ? (
                    <>
                      <Input
                        size="md"
                        slotProps={{
                          input: {
                            ref: upcInputRef,
                          },
                        }}
                        value={upcInput} // 绑定状态到输入框
                        placeholder={t('lb_upc_or_sku')}
                        onChange={(e) => setUPCInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (
                              currentItem.item.upc === upcInput ||
                              currentItem.item.sku === upcInput
                            ) {
                              setUPCCheck(1);
                            } else {
                              setUPCCheck(2);
                            }
                          }
                        }}
                      />
                      <span>
                        <Stack>
                          <span className={` tx-primary tx-18`}>
                            {currentItem.item.upc},{currentItem.item.sku}
                            {upcCheck === 1 ? (
                              <CheckCircleIcon sx={{ color: 'green' }} />
                            ) : upcCheck === 2 ? (
                              <DangerousIcon sx={{ color: 'red' }} />
                            ) : null}{' '}
                          </span>
                          {currentItem?.item.batchNumber &&
                            currentItem?.item.batchNumber !== 'N/A' && (
                              <span>
                                {t('lb_batch_number')}:
                                <span className={` tx-primary tx-18`}>
                                  {currentItem.batchNumber}
                                </span>
                              </span>
                            )}
                          {currentItem?.expiryDate &&
                            currentItem?.expiryDate !== 'N/A' && (
                              <span>
                                {t('lb_expiry_date')}:
                                <span className={` tx-primary tx-18`}>
                                  {currentItem.expiryDate}
                                </span>
                              </span>
                            )}
                        </Stack>
                      </span>
                    </>
                  ) : null}
                  <>
                    <Stack direction="row">
                      <Stack direction="row" className="">
                        <span className="mt-1">{t('lb_total')}:</span>
                        <span
                          className="bg-success text-white ps-2 pe-2  tx-22"
                          style={{
                            borderRadius: '4px',
                          }}
                          onClick={() => {
                            setPickedQty(currentItem?.totalQuantity);
                            setShortQty('0');
                          }}
                        >
                          {currentItem?.totalQuantity}
                        </span>
                      </Stack>
                      <Stack direction="row" className="  mg-l-4">
                        <span className="mt-1 "> {t('lb_picked')}:</span>
                        <Input
                          size="md"
                          value={pickedQty} // 绑定状态到输入框
                          onFocus={() => setInputPad('picked')} // 绑定 onFocus 事件
                          placeholder=""
                          sx={{ width: '80px', fontWeight: 600, fontSize: 22 }}
                        />
                      </Stack>
                      <Stack direction="row" className="  mg-l-4">
                        <span className="mt-1 "> {t('lb_short')}:</span>

                        <Input
                          size="md"
                          value={shortQty} // 绑定状态到输入框
                          sx={{
                            width: '80px',
                            color: 'red',
                            fontWeight: 600,
                            fontSize: 22,
                          }}
                          placeholder=""
                          onFocus={() => setInputPad('short')} // 绑定 onFocus 事件
                        />
                      </Stack>
                    </Stack>
                    <Stack direction="row">
                      {inputPad === 'picked' && (
                        <NumericInputPad
                          value={pickedQty}
                          setInputValue={setPickedQty}
                          setInputPad={setInputPad}
                        />
                      )}
                      {inputPad === 'short' && (
                        <NumericInputPad
                          value={shortQty}
                          setInputValue={setShortQty}
                          setInputPad={setInputPad}
                        />
                      )}
                    </Stack>
                  </>
                  <Stack direction="row" gap={3}>
                    <Button
                      className="mg-l-6"
                      onClick={() => {
                        handleClear();
                      }}
                    >
                      {t('btn_clear')}
                    </Button>
                    <Button
                      className="mg-l-6"
                      sx={{
                        backgroundColor: Number(shortQty) > 0 ? 'red' : 'green',
                      }}
                      onClick={() => {
                        setFinishPickingModalShow(true);
                      }}
                    >
                      {Number(shortQty) > 0
                        ? t('btn_force_finish')
                        : t('btn_finish')}
                    </Button>
                  </Stack>
                </Stack>
              </div>
            )}

            <DialogContent>
              <Tabs
                activeKey={currentTab}
                onSelect={(key: any) => setCurrentTab(key)}
                id="uncontrolled-tab-example"
                className="mb-3"
              >
                <Tab
                  eventKey="unpicked"
                  title={`${t('lb_picking')}:${pickingItems?.length || 0}`}
                >
                  <div
                    className="pd-l-4 pd-r-4"
                    style={{
                      height: currentItem ? '60vh' : '80vh',
                      overflow: 'auto',
                    }}
                  >
                    {summary && (
                      <PickingListForBulkOrder
                        data={pickingItems}
                        setCurrentItem={setCurrentItem}
                      />
                    )}
                  </div>
                </Tab>
                <Tab
                  eventKey="picked"
                  title={`${t('lb_picked')}:${pickedItems?.length || 0}`}
                >
                  <div className="pd-l-4 pd-r-4">
                    {summary && (
                      <PickingListForBulkOrder
                        data={pickedItems}
                        setCurrentItem={undefined}
                      />
                    )}
                  </div>
                </Tab>
              </Tabs>
            </DialogContent>
          </Sheet>
        </div>
        {/* 子级 Drawer */}
      </Drawer>
    </React.Fragment>
  );
}
