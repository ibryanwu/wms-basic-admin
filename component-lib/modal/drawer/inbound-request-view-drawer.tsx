// InboundRequestViewTable
import PickingListForOneOrder from '@/component-lib/data-table/picking/PickingListForOneOrderDt';
import { useToken } from '@/lib/hooks/use-token';
import { useGetPickingListData } from '@/rest/outbound';
import { sortPickingItemsByLocation } from '@/service/outbound';
import { openInboundRequestViewDrawerAtom } from '@/stores/atom';
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
import { useApproveRequest } from '@/rest/inbound-request';
import { Col, Row } from 'react-bootstrap';

export default function InboundRequestViewDrawer(props: any) {
  // Values  -------------------------------------------------
  const { data, refreshList } = props;
  const { hasToken } = useToken();
  const routes = useRouter();
  // Auth ----------------------------------------------------
  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);
  // Atoms ---------------------------------------------------
  const [openInboundRequestViewDrawer, setOpenInboundRequestViewDrawer] =
    useAtom(openInboundRequestViewDrawerAtom);

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
    if (approveOrderRes?.code === 0) {
      toast.success('Convert Successfully', toastOptions);
      refreshList();
      handleClose();
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
    setOpenInboundRequestViewDrawer(false);
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
          title: 'Confirm and convert into Inbound Order',
          body: 'Please double-check this Request.',
          buttonName: 'Convert',
        }}
      />
      <Drawer
        anchor="right"
        size="lg"
        variant="plain"
        open={openInboundRequestViewDrawer}
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
              <Col md={12}>remarks:{data?.remark}</Col>
            </Row>
            <DialogContent>
              <div className="pd-l-4 pd-r-4">
                {data.inboundRequestDetail && (
                  <RequestViewTable data={data.inboundRequestDetail} />
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
                    Convert into Inbound Order
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
