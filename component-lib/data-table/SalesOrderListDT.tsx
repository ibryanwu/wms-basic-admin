import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  deleteOrderIdAtom,
  deleteSalesOrderIdAtom,
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
import { useDeletePruchaseOrder } from '@/rest/purchase';
import { convertSalesOrderSeqNo } from '@/service/sales';
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

export default function SalesOrderListDataTable(props: any) {
  const { orderListData } = props;

  const routes = useRouter();
  const [_edit, setEditItem] = useAtom(editItemAtom);
  const [_, setDeleteOrderId] = useAtom(deleteSalesOrderIdAtom);
  //
  const [editRowId, setEditRowId] = useState('');
  //
  //
  useEffect(() => {
    if (editRowId !== '') {
      routes.push(`/sales-order/${editRowId}`);
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
      name: 'OrderInfo',
      width: '30%',
      selector: (row: any) => [row.invoice_no],
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
              <span className="mg-l-4 mg-r-4 tx-primary tx-16">
                {row.isVoid ? (
                  <mark>
                    <s>{convertSalesOrderSeqNo(row.seq_order_no)}</s>
                  </mark>
                ) : (
                  convertSalesOrderSeqNo(row.seq_order_no)
                )}
              </span>
              Invoice#:
              <span className={`mg-l-4 mg-r-4 tx-primary tx-16`}>
                {row.isVoid ? <del>{row.invoice_no}</del> : row.invoice_no}
              </span>
              Batch#:
              <span className=" mg-l-4 mg-r-4 tx-primary tx-16">
                {row.batch_number}
              </span>{' '}
              Items:
              <span className=" mg-l-4 mg-r-4 tx-16 tx-medium">
                {row.salesOrderItems.length}
              </span>{' '}
            </span>
            <span className="text-secondary tx-16 tx-medium">
              {row.vendor.name}
            </span>
            <span>
              Order Date:{' '}
              <span className="tx-medium">{row.sales_order_date}</span> ,
              Received: <span className="tx-medium">{row.received_date}</span>
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
          {row.total && (
            <div className="wd-100p">
              <Stack>
                <div className="d-flex flex-row-reverse">
                  {row.is_promotional_item ? (
                    <>
                      <span className={clsx('tx-16')}>Total: 0</span>
                    </>
                  ) : (
                    <span className={clsx('tx-16 ')}>
                      Total:
                      <span className="mg-l-6">
                        {row.total.total.toFixed(2)}
                      </span>
                    </span>
                  )}
                </div>{' '}
                {row.is_promotional_item && (
                  <div className="d-flex flex-row-reverse">
                    <del>
                      <span>
                        Total:
                        <span className="mg-l-6">
                          {row.total.total.toFixed(2)}
                        </span>
                      </span>
                    </del>
                  </div>
                )}
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    SubTotal:
                    <span className="mg-l-6">
                      {row.total.subtotal.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    Tax:
                    <span className="mg-l-6">{row.total.tax.toFixed(2)}</span>
                  </span>
                </div>
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    Shipping Fee:
                    <span className="mg-l-6">
                      {row.total.shipping_fee.toFixed(2)}
                    </span>
                  </span>
                </div>
              </Stack>
            </div>
          )}
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
              {row.is_approved && !row.isVoid && (
                <span className="mg-l-2 badge bg-success badge-pill me-1 tx-12">
                  Approved
                </span>
              )}
              {!row.is_approved && (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Not Approved
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
      name: 'Warehouse',
      width: '200px',
      selector: (row: any) => [row.is_finished],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack className="" gap={2}>
            <div className="wd-40 ">
              {row.warehouse.name} {row.warehouse.description}
            </div>
            <div className="wd-40 ">Location: {row.warehouse.location}</div>
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
            <span>{row.print_remark !== '' ? `${row.remark}` : null} </span>
            <span>
              {row.print_remark !== '' ? `Print:${row.print_remark}` : null}
            </span>
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
    <span className="datatable">
      {orderListData?.data && (
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
