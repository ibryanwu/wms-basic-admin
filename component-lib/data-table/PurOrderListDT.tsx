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
import { useDeletePruchaseOrder } from '@/rest/purchase';
import { convertPurOrderSeqNo } from '@/service/purchase';
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

export default function PurOrderListDataTable(props: any) {
  const { t } = useTranslation('purchase_order_list');
  const { orderListData } = props;

  const routes = useRouter();
  const [_edit, setEditItem] = useAtom(editItemAtom);
  const [_, setDeleteOrderId] = useAtom(deleteOrderIdAtom);
  //
  const [editRowId, setEditRowId] = useState('');
  //
  //
  useEffect(() => {
    if (editRowId !== '') {
      routes.push(`/purchase-order/${editRowId}`);
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
      name: t('dtlb_order_info'),
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
              {t('dtlb_order_no')}:
              <span className={`mg-l-4 mg-r-4 tx-primary tx-16`}>
                {row.isVoid ? (
                  <mark>
                    <s>{convertPurOrderSeqNo(row.seq_order_no)}</s>
                  </mark>
                ) : (
                  convertPurOrderSeqNo(row.seq_order_no)
                )}
              </span>
              {t('dtlb_invoice_no')}:
              <span className="mg-l-4 mg-r-4 tx-primary tx-16">
                {row.isVoid ? <del>{row.invoice_no}</del> : row.invoice_no}
              </span>
              {t('dtlb_batch_no')}:
              <span className=" mg-l-4 mg-r-4 tx-primary tx-16">
                {row.batch_number}
              </span>{' '}
              {t('dtlb_items')}:
              <span className=" mg-l-4 mg-r-4 tx-16 tx-medium">
                {row.purchaseItems.length}
              </span>{' '}
            </span>
            <span className="text-secondary tx-16 tx-medium">
              {row.vendor.name}
            </span>
            <span>
              {t('dtlb_pur_date')}: <span className="tx-medium">{row.purchased_date}</span>{' '}
              , {t('dtlb_received')}: <span className="tx-medium">{row.received_date}</span>
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
      name: t('dtlb_total'),
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
                      <span className={clsx('tx-16')}>{t('dtlb_total')}: 0</span>
                    </>
                  ) : (
                    <span className={clsx('tx-16 ')}>
                      {t('dtlb_total')}:
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
                        {t('dtlb_total')}:
                        <span className="mg-l-6">
                          {row.total.total.toFixed(2)}
                        </span>
                      </span>
                    </del>
                  </div>
                )}
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    {t('dtlb_subtotal')}:
                    <span className="mg-l-6">
                      {row.total.subtotal.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    {t('dtlb_tax')}:
                    <span className="mg-l-6">{row.total.tax.toFixed(2)}</span>
                  </span>
                </div>
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    {t('dtlb_shipping_fee')}:
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
      name: t('dtlb_status'),
      width: '160px',
      selector: (row: any) => [row.is_finished],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack className="" gap={2}>
            <div className="wd-40 ">
              {row.is_approved && !row.isVoid && (
                <span className="mg-l-2 badge bg-success badge-pill me-1 tx-12">
                  {t('dtlb_approved')}
                </span>
              )}
              {!row.is_approved && (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  {t('dtlb_not_approved')}
                </span>
              )}
            </div>
            <div className="wd-40 ">
              {row.isVoid && (
                <span className="mg-l-2 badge bg-danger badge-pill me-1 tx-12">
                  {t('dtlb_void')}
                </span>
              )}
            </div>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_warehouse'),
      width: '200px',
      selector: (row: any) => [row.is_finished],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack className="" gap={2}>
            <div className="wd-40 ">
              {row.warehouse.name} {row.warehouse.description}
            </div>
            <div className="wd-40 ">{t('dtlb_location')}: {row.warehouse.location}</div>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_remark'),

      selector: (row: any) => [row.paymentremark],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack>
            <span>{row.print_remark !== '' ? `${row.remark}` : null} </span>
            <span>
              {row.print_remark !== '' ? `${t('dtlb_print')}:${row.print_remark}` : null}
            </span>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_op'),
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
                  console.log('🚀 ~ file: PurOrderListDT.tsx:269 ~ row:', row);

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
