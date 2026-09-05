import PickingListForOneOrder from '@/component-lib/data-table/picking/PickingListForOneOrderDt';
import { useToken } from '@/lib/hooks/use-token';
import { useGetPickingListData } from '@/rest/outbound';
import { sortPickingItemsByLocation } from '@/service/outbound';
import { openPickingListDrawerAtom } from '@/stores/atom';
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
import Input from '@mui/joy/Input';
import { useIsPicked } from '@/rest/inventory';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
export default function PickingListDrawer(props: any) {
  // Values  -------------------------------------------------
  const { data, setPickingOrderId, refetchOrder, refetchPickingList } = props;
  const { hasToken } = useToken();
  const routes = useRouter();
  // Auth ----------------------------------------------------
  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);
  // Atoms ---------------------------------------------------
  const [openPickingListDrawer, setOpenPickingListDrawer] = useAtom(
    openPickingListDrawerAtom,
  );

  // UseState  -----------------------------------------------
  const [sortedPickingItems, setSortedPickingItems] = useState([]);
  const [sortedPickedItems, setSortedPickedItems] = useState([]);
  const [sortedItems, setSortedItems] = useState([]);
  const [pickedItem, setPickedItem] = useState(0);
  const [finishConfirmModalShow, setFinishConfirmModalShow] = useState(false);
  const [currentTab, setCurrentTab] = useState('unpicked'); //unpicked picked
  const [currentItem, setCurrentItem] = useState<any>();
  const [locationCodeInput, setLocationCodeInput] = useState('');
  const [upcInput, setUPCInput] = useState('');
  const [upcCheck, setUPCCheck] = useState(0); // 0-初始 1-通过 2-失败 9-无需校验
  const [locationCodeCheck, setLocationCodeCheck] = useState(0); // 0-初始 1-通过 2-失败 9-无需校验
  const upcInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const {
    mutate: finishOrder,
    data: finishOrderRes,
    isLoading: isLoadingFinishOrder,
    serverError: finishOrderError,
  } = useFinishOrder();

  const {
    mutate: isPicked,
    data: isPickedRes,
    isLoading: isPickedOrder,
    serverError: isPickedError,
  } = useIsPicked();

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
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  }, []);
  useEffect(() => {
    if (data?.items) {
      setSortItemList(data);
    }
  }, [data]);

  useEffect(() => {
    if (finishOrderRes?.code === 0) {
      toast.success('Finish Successfully', toastOptions);
      refetchOrder();
      handleClose();
    } else if (finishOrderRes?.msg) {
      toast.error(`Finish failed:${finishOrderRes?.msg}`, toastOptions);
      refetchOrder();
      handleClose();
    }
  }, [finishOrderRes]);

  useEffect(() => {
    if (isPickedRes?.code === 0) {
      refetchPickingList();
    }
    setCurrentItem(undefined);
    handleClear();
  }, [isPickedRes]);

  // Function ------------------------------------------------
  const setSortItemList = (data: any) => {
    const sortItems = sortPickingItemsByLocation(data?.items);
    const sortPickingItems = sortItems.filter(
      (item: any) => item.isPicked === false,
    );
    setSortedItems(sortItems);
    setSortedPickedItems(
      sortItems.filter((item: any) => item.isPicked === true),
    );
    setSortedPickingItems(sortPickingItems);
  };

  const handleFinishOrder = () => {
    finishOrder({ id: data.order.id });
  };
  const handleClose = () => {
    if (setPickingOrderId) {
      setPickingOrderId(undefined);
    }
    setCurrentItem(undefined);
    setOpenPickingListDrawer(false);
  };

  const handleClear = () => {
    setLocationCodeInput('');
    setUPCInput('');
    setUPCCheck(0);
    setLocationCodeCheck(0);
  };

  return (
    <React.Fragment>
      <ConfirmModal
        key={3}
        show={finishConfirmModalShow}
        setShow={setFinishConfirmModalShow}
        fun={() => {
          handleFinishOrder();
          setFinishConfirmModalShow(false);
        }}
        info={{
          title: 'Confirm Finish Order',
          body: 'Please double-check this order. After Finish, the inventory will be changed!',
          buttonName: 'Finish',
        }}
      />
      <Drawer
        anchor="right"
        size="lg"
        // variant="plain"
        open={openPickingListDrawer}
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
              Picking {data?.order?.order_no}
              <Button
                className="mg-l-6"
                onClick={() => {
                  setFinishConfirmModalShow(true);
                }}
              >
                Finish Order
              </Button>
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
                            placeholder="Scan LocationCode"
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
                            <span className={` bg-danger text-white  tx-22`}>
                              {currentItem.location}
                            </span>
                            {locationCodeCheck === 1 ? (
                              <CheckCircleIcon sx={{ color: 'green' }} />
                            ) : locationCodeCheck === 2 ? (
                              <DangerousIcon sx={{ color: 'red' }} />
                            ) : null}
                          </div>
                        </Col>
                        <Col xs={2} className="p-0 ">
                          <div className="mt-1">
                            Pick:
                            <span className="bg-success text-white  tx-22">
                              {currentItem?.quantity}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                  {currentItem?.item.upc && (
                    <>
                      <Input
                        size="md"
                        slotProps={{
                          input: {
                            ref: upcInputRef,
                          },
                        }}
                        value={upcInput} // 绑定状态到输入框
                        placeholder="Scan UPC"
                        onChange={(e) => setUPCInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (currentItem.item.upc === upcInput) {
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
                            {currentItem.item.upc}
                            {upcCheck === 1 ? (
                              <CheckCircleIcon sx={{ color: 'green' }} />
                            ) : upcCheck === 2 ? (
                              <DangerousIcon sx={{ color: 'red' }} />
                            ) : null}{' '}
                          </span>
                          {currentItem?.item.batchNumber &&
                            currentItem?.item.batchNumber !== 'N/A' && (
                              <span>
                                Batch#:
                                <span className={` tx-primary tx-18`}>
                                  {currentItem.batchNumber}
                                </span>
                              </span>
                            )}
                          {currentItem?.expiryDate &&
                            currentItem?.expiryDate !== 'N/A' && (
                              <span>
                                ExpiryDate:
                                <span className={` tx-primary tx-18`}>
                                  {currentItem.expiryDate}
                                </span>
                              </span>
                            )}
                        </Stack>
                      </span>
                    </>
                  )}

                  <Stack direction="row" gap={3}>
                    <Button
                      className="mg-l-6"
                      onClick={() => {
                        setCurrentItem(undefined);
                        handleClear();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="mg-l-6"
                      onClick={() => {
                        handleClear();
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      className="mg-l-6"
                      onClick={() => {
                        if (
                          (locationCodeCheck === 1 ||
                            locationCodeCheck === 9) &&
                          (upcCheck === 1 || upcCheck === 9)
                        ) {
                          isPicked({
                            lockId: currentItem.lockId,
                            isPicked: true,
                          });
                        } else {
                          toast.error('Please Scan Code First', toastOptions);
                        }
                      }}
                    >
                      Confirm Picked
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
                  title={`Picking:${sortedPickingItems?.length || 0}`}
                >
                  <div
                    className="pd-l-4 pd-r-4"
                    style={{
                      height: currentItem ? '60vh' : '80vh',
                      overflow: 'auto',
                    }}
                  >
                    {sortedPickingItems && (
                      <PickingListForOneOrder
                        data={sortedPickingItems}
                        setPickedItem={setPickedItem}
                        setCurrentItem={setCurrentItem}
                      />
                    )}
                  </div>
                </Tab>
                <Tab
                  eventKey="picked"
                  title={`Picked:${sortedPickedItems?.length || 0}`}
                >
                  <div className="pd-l-4 pd-r-4">
                    {sortedPickedItems && (
                      <PickingListForOneOrder
                        data={sortedPickedItems}
                        setPickedItem={undefined}
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
