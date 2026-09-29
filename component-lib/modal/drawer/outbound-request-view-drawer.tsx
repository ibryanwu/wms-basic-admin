// InboundRequestViewTable
import PickingListForOneOrder from '@/component-lib/data-table/picking/PickingListForOneOrderDt';
import { RESULT_CODE } from '@/lib/constants';
import { useToken } from '@/lib/hooks/use-token';
import { useGetPickingListData } from '@/rest/outbound';
import {
  sortPickingItemsByLocation,
  strategyOptions,
} from '@/service/outbound';
import { openOutboundRequestViewDrawerAtom } from '@/stores/atom';
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
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';
import { toast } from 'react-toastify';
import { toastOptions } from '@/utils/public';
import { useFinishOrder } from '@/rest/outbound';
import RequestViewTable from '@/component-lib/data-table/request-view/request-detailDT';
import { useApproveRequest } from '@/rest/outbound-request';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function OutboundRequestViewDrawer(props: any) {
  // Values  -------------------------------------------------
  const { data, refreshList } = props;
  const strategy = strategyOptions.find(
    (option) => option.value === data.strategy,
  );
  const { hasToken } = useToken();
  const routes = useRouter();
  const { t } = useTranslation('request_list');
  // Auth ----------------------------------------------------
  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);
  // Atoms ---------------------------------------------------
  const [openOutboundRequestViewDrawer, setOpenOutboundRequestViewDrawer] =
    useAtom(openOutboundRequestViewDrawerAtom);

  // UseState  -----------------------------------------------
  const [approveModalShow, setApproveModalShow] = useState(false);

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const {
    mutate: approveOrder,
    data: approveOrderRes,
    isLoading: isLoadingapproveOrder,
    serverError: approveOrderError,
  } = useApproveRequest();
  // Use Effect  ---------------------------------------------
  useEffect(() => {}, [data]);
  useEffect(() => {
    if (approveOrderRes?.code === RESULT_CODE.SUCCESS) {
      toast.success('Convert Successfully', toastOptions);
      refreshList();
      handleClose();
    } else if (
      approveOrderRes?.code === RESULT_CODE.DATA_ALREADY_EXISTED
    ) {
      toast.error(t('toast_invoice_no_duplicate'), toastOptions);
    } else if (approveOrderRes?.msg) {
      toast.error(`Convert failed:${approveOrderRes?.msg}`, toastOptions);
      refreshList();
      handleClose();
    }
  }, [approveOrderRes]);

  // Function ------------------------------------------------
  const handleApproved = () => {
    approveOrder({ id: data.id });
  };
  const handleClose = () => {
    setOpenOutboundRequestViewDrawer(false);
  };
  return (
    <React.Fragment>
      <ConfirmModal
        key={3}
        show={approveModalShow}
        setShow={setApproveModalShow}
        fun={() => {
          handleApproved();
          setApproveModalShow(false);
        }}
        info={{
          title: 'Confirm and convert into Outbound Order',
          body: 'Please double-check this Request.',
          buttonName: 'Convert',
        }}
      />
      <Drawer
        anchor="right"
        size="lg"
        variant="plain"
        open={openOutboundRequestViewDrawer}
        onClose={(_, reason) => {
          handleClose();
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
            <DialogTitle>Request {data?.order_no}</DialogTitle>
            <ModalClose />
            <Row>
              <Col md={4}>{data?.vendor?.name}</Col>
              <Col md={3}>{data?.vendor?.email}</Col>
              <Col md={3}>{data?.vendor?.phone}</Col>
            </Row>
            <Row>
              <Col md={12}>
                {data?.vendor?.address}
                {data?.vendor?.city}
                {data?.vendor?.province}
              </Col>
            </Row>
            {data?.batch_number && <>BatchNumber:{data?.batch_number}</>}
            <Row>
              {strategy && <Col md={4}>Strategy:{strategy.label}</Col>}
              <Col md={8}>remarks:{data?.remark}</Col>
            </Row>
            <DialogContent>
              <div className="pd-l-4 pd-r-4">
                {data.outboundRequestDetail && (
                  <RequestViewTable data={data.outboundRequestDetail} />
                )}
              </div>
            </DialogContent>
            {!data.is_approved && (
              <Stack
                direction="row"
                justifyContent="space-between"
                useFlexGap
                spacing={1}
              >
                <Stack direction="row" gap={3}>
                  <Button
                    className="mg-l-6"
                    onClick={() => {
                      setApproveModalShow(true);
                    }}
                  >
                    Convert into Outbound Order
                  </Button>
                </Stack>
              </Stack>
            )}
          </Sheet>
        </div>
      </Drawer>
    </React.Fragment>
  );
}
