import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  deleteOrderIdAtom,
  editItemAtom,
  itemListAtom,
  openPurItemDrawerAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useDeleteOutboundOrder } from '@/rest/outbound';
import {
  convertOutboundOrderSeqNo,
  orderTypeOptions,
} from '@/service/outbound';
import dayjs from 'dayjs';
import { serverToLocal } from '@/utils/public';
import { useTranslation } from 'react-i18next';
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

export default function TransferOrderListDataTable(props: any) {
  const { orderListData } = props;
  const { t } = useTranslation('transfer_order_list');

  const routes = useRouter();
  const [_edit, setEditItem] = useAtom(editItemAtom);
  const [_, setDeleteOrderId] = useAtom(deleteOrderIdAtom);
  //
  const [editRowId, setEditRowId] = useState('');
  //
  //
  useEffect(() => {
    if (editRowId !== '') {
      routes.push(`/transfer-order/${editRowId}`);
    }
  }, [editRowId]);

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
      name: t('lb_order_info'),
      width: '30%',
      selector: (row: any) => [row.order_no],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditRowId(row.id);
          }}
        >
          <Stack>
            <span>
              Order#:
              <span className={`mg-l-4 mg-r-4 tx-primary tx-16`}>
                <mark>{row.order_no}</mark>
              </span>
              Items:
              <span className=" mg-l-4 mg-r-4 tx-16 tx-medium">
                {row.transferOrderDetails.length}
              </span>{' '}
            </span>

            {/* <span>
              Transfer: <span className="tx-medium">{row.createdAt}</span>
            </span> */}
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
      name: t('lb_order_status'),
      width: '160px',
      selector: (row: any) => [row.is_finished],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack className="" gap={2}>
            <div className="wd-40 ">
              {!row.is_approved ? (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Not Approved
                </span>
              ) : (
                <span className="mg-l-2 badge bg-success badge-pill me-1 tx-12">
                  Approved
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
      name: t('lb_from_warehouse'),
      width: '200px',
      selector: (row: any) => [row.is_finished],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack className="" gap={2}>
            {row.fromWarehouse ? (
              <>
                <div className="wd-40 ">{row.fromWarehouse.name}</div>
                {/* <div className="wd-40 ">Location: {row.warehouse.location}</div> */}
              </>
            ) : (
              <span className="tx-danger">Unassigned</span>
            )}
          </Stack>
        </div>
      ),
    },

    {
      name: t('lb_remark'),
      selector: (row: any) => [row.paymentremark],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack>
            <span>{row.print_remark !== '' ? `${row.remark}` : null} </span>

            <span>
              {row.print_remark !== '' ? `Print:${row.print_remark}` : null}
            </span>
          </Stack>
        </div>
      ),
    },
    // {
    //   name: 'Op',
    //   width: '8%',
    //   sortable: false,
    //   cell: (row: any) => {
    //     return (
    //       !row.is_approved && (
    //         <div className="">
    //           <IconButton
    //             color="primary"
    //             aria-label="Delete"
    //             onClick={() => {
    //               setEditRowId(row.id);
    //             }}
    //           >
    //             <EditNote />
    //           </IconButton>
    //           <IconButton
    //             color="warning"
    //             aria-label="Delete"
    //             onClick={() => {
    //               console.log('🚀 ~ file: PurOrderListDT.tsx:269 ~ row:', row);

    //               setDeleteOrderId(row.id);
    //             }}
    //           >
    //             <DeleteForever />
    //           </IconButton>
    //         </div>
    //       )
    //     );
    //   },
    // },
  ];

  return (
    <span className="datatable">
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
    </span>
  );
}
