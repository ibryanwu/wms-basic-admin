import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  deleteOrderIdAtom,
  editItemAtom,
  openOutboundRequestViewDrawerAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { orderTypeOptions } from '@/service/inbound';
import InboundRequestViewDrawer from '../modal/drawer/inbound-request-view-drawer';
import _ from 'lodash';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';

import OutboundRequestViewDrawer from '../modal/drawer/outbound-request-view-drawer';
import { useDeleteOutboundRequest } from '@/rest/outbound-request';
//
const customStylesForDataTable = {
  rows: {
    style: {
      '&:hover': {
        backgroundColor: '#f2f8ff', // 与你的CSS样式相同的颜色
      },
      paddingTop: '5px',
      paddingBottom: '5px',
      maxHeight: '400px', // 设置表格的最大高度
      overflowY: 'auto', // 当内容超出高度时显示垂直滚动条
    },
  },
};

const conditionalRowStyles = [{}];

export default function OutboundRequestListDataTable(props: any) {
  const { orderListData, refreshList } = props;
  const [_openDrawer, setOpenOutboundRequestViewDrawer] = useAtom(
    openOutboundRequestViewDrawerAtom,
  );

  const routes = useRouter();
  const [editItem, setEditItem] = useAtom(editItemAtom);
  //
  const [editRowId, setEditRowId] = useState('');
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState('');

  //
  const {
    mutate: deleteRequestById,
    data: deleteRes,
    isLoading: isDeleteLoading,
  } = useDeleteOutboundRequest();

  //
  useEffect(() => {
    if (editRowId !== '') {
      routes.push(`/inbound-request/${editRowId}`);
    }
  }, [editRowId]);
  useEffect(() => {
    if (!deleteRes) return;
    if (deleteRes?.code === 0) {
      refreshList();
      toast.success('Request delete successfully');
    } else {
      toast.error('Delete order failed');
    }
  }, [deleteRes]);

  const deleteById = () => {
    if (deleteOrderId !== '') {
      deleteRequestById({ id: deleteOrderId });
      setDeleteOrderId('');
    }
  };

  //
  const columnsItemList = [
    {
      name: '#',
      width: '3%',
      selector: (row: any) => row.rowNumber,
      cell: (row: any, index: number) => index + 1, // index 从 0 开始，所以加 1
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: 'Request Info',
      width: '30%',
      selector: (row: any) => [row.invoice_no],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditItem(row);
            setOpenOutboundRequestViewDrawer(true);
          }}
        >
          <Stack>
            <span>
              Request#:
              <span className={`mg-l-4 mg-r-4 tx-primary tx-16`}>
                {/* {row.isVoid ? (
                  <mark>
                    <s>{convertInboundRequestSeqNo(row.seq_order_no)}</s>
                  </mark>
                ) : (
                  convertInboundRequestSeqNo(row.seq_order_no)
                )} */}
                <mark>{row.order_no}</mark>
              </span>
              Invoice#:
              <span className="mg-l-4 mg-r-4 tx-primary tx-16">
                {row.isVoid ? <del>{row.invoice_no}</del> : row.invoice_no}
              </span>
              Batch#:
              <span className=" mg-l-4 mg-r-4 tx-primary tx-16">
                {row.batch_number}
              </span>{' '}
              Items:
              <span className=" mg-l-4 mg-r-4 tx-16 tx-medium">
                {row.outboundRequestDetail.length}
              </span>{' '}
            </span>
            <span className="text-secondary tx-16 tx-medium">
              {row.vendor.name}
            </span>

            {row.highlight !== undefined && row.highlight && (
              <span className="tx-danger">
                <mark>{row.highlight}</mark>
              </span>
            )}
          </Stack>
        </div>
      ),
    },

    {
      name: 'Total ',
      width: '15%',
      selector: (row: any) => [row.tax_rate],
      sortable: false,
      cell: (row: any) => (
        <>
          <div className="wd-100p">
            <Stack>
              <div className="d-flex flex-row-reverse">
                <span className={clsx('tx-16 ')}>
                  Total:
                  <span className="mg-l-6">
                    {Number(row.total_amount)?.toFixed(2) || '0.00'}
                  </span>
                </span>
              </div>
              <div className="d-flex flex-row-reverse">
                <span className="tx-gray-600">
                  SubTotal:
                  <span className="mg-l-6">
                    {Number(row.subtotal_amount)?.toFixed(2) || '0.00'}
                  </span>
                </span>
              </div>
              <div className="d-flex flex-row-reverse">
                <span className="tx-gray-600">
                  Tax:
                  <span className="mg-l-6">
                    {Number(row.tax_amount)?.toFixed(2) || '0.00'}
                  </span>
                </span>
              </div>
              <div className="d-flex flex-row-reverse">
                <span className="tx-gray-600">
                  Shipping Fee:
                  <span className="mg-l-6">
                    {Number(row.shipping_fee)?.toFixed(2) || '0.00'}
                  </span>
                </span>
              </div>
            </Stack>
          </div>
        </>
      ),
    },
    {
      name: 'Status',
      width: '160px',
      selector: (row: any) => [row.is_finished],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack className="" gap={2}>
            <div className="wd-40 ">
              <span className="mg-l-2 badge bg-info badge-pill me-1 tx-12">
                {
                  orderTypeOptions.find((item) => item.value === row.order_type)
                    ?.label
                }
              </span>
            </div>
            <div className="wd-40 ">
              {row.is_approved && !row.isVoid && (
                <span className="mg-l-2 badge bg-success badge-pill me-1 tx-12">
                  Approved
                </span>
              )}
              {!row.is_approved && (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Waiting Approval
                </span>
              )}
            </div>
            <div className="wd-40 ">
              {row.isVoid && (
                <span className="mg-l-2 badge bg-danger badge-pill me-1 tx-12">
                  Void
                </span>
              )}
            </div>
          </Stack>
        </div>
      ),
    },

    {
      name: 'Remark',

      selector: (row: any) => [row.paymentremark],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack>
            {!_.isNil(row.remark) && !_.isEmpty(row.remark) && (
              <span>{row.remark}</span>
            )}
            {!_.isNil(row.print_remark) && !_.isEmpty(row.print_remark) && (
              <span>${row.print_remark}</span>
            )}
          </Stack>
        </div>
      ),
    },
    {
      name: 'Op',
      width: '8%',
      sortable: false,
      cell: (row: any) => {
        return (
          !row.is_approved && (
            <div className="">
              <IconButton
                color="primary"
                aria-label="Delete"
                onClick={() => {
                  setEditRowId(row.id);
                }}
              >
                <EditNote />
              </IconButton>
              <IconButton
                color="warning"
                aria-label="Delete"
                onClick={() => {
                  setConfirmModalShow(true);
                  setDeleteOrderId(row.id);
                }}
              >
                <DeleteForever />
              </IconButton>
            </div>
          )
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <ConfirmModal
        key={1}
        show={confirmModalShow}
        setShow={setConfirmModalShow}
        fun={() => {
          deleteById();
          setConfirmModalShow(false);
        }}
        info={{
          title: 'Confirm Approve Request',
          body: 'Please double-check this order!',
          buttonName: 'Approve',
        }}
      />
      {editItem && (
        <OutboundRequestViewDrawer data={editItem} refreshList={refreshList} />
      )}
      {orderListData?.data?.length > 0 && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={orderListData.data}
          fixedHeader
          //pagination={true}
          customStyles={customStylesForDataTable}
          //conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </div>
  );
}
