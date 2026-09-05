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

export default function OutboundOrderListDataTable(props: any) {
  const { t } = useTranslation('outbound_order_list'); // 加载 xxx.json 翻译文件

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
      routes.push(`/outbound/${editRowId}`);
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
              Order#:
              <span className={`mg-l-4 mg-r-4 tx-primary tx-16`}>
                <mark>{row.order_no}</mark>
              </span>
              {row.invoice_no && (
                <>
                  Invoice#:
                  <span className="mg-l-4 mg-r-4 tx-primary tx-16">
                    {row.isVoid ? <del>{row.invoice_no}</del> : row.invoice_no}
                  </span>
                </>
              )}
              {row.batch_number && (
                <>
                  Batch#:
                  <span className=" mg-l-4 mg-r-4 tx-primary tx-16">
                    {row.batch_number}
                  </span>
                </>
              )}
              Items:
              <span className=" mg-l-4 mg-r-4 tx-16 tx-medium">
                {row.outboundOrderDetail.length}
              </span>{' '}
            </span>
            <span className="text-secondary tx-16 tx-medium">
              {row.vendor.name}
            </span>
            <span>
              Outbound: <span className="tx-medium">{row.outbound_date}</span>
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
      name: t('dtlb_status'),
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
              {!row.is_approved && (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Not Approved
                </span>
              )}
            </div>
            <div className="wd-40 ">
              {row.statusCounts.picked !== row.outboundOrderDetail.length &&
              !row.is_finished &&
              row.is_approved ? (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Picking...
                </span>
              ) : (
                <span
                  className="mg-l-2 badge badge-pill me-1 tx-12"
                  style={{ backgroundColor: 'black' }}
                >
                  {row.statusCounts.short === 0 ? '' : 'Partial Picked'}
                </span>
              )}

              {row.is_finished && (
                <span
                  className="mt-2 mg-l-2 badge  badge-pill me-1 tx-12 "
                  style={{ backgroundColor: 'gray' }}
                >
                  Finished
                </span>
              )}
              {!row.is_finished &&
                row.statusCounts.picked === row.outboundOrderDetail.length && (
                  <span
                    className="mt-2 mg-l-2 badge  badge-pill me-1 tx-12 "
                    style={{ backgroundColor: 'gray' }}
                  >
                    Waiting Finish
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
      name: t('dtlb_picking_process'),
      width: '160px',
      selector: (row: any) => [row.is_finished],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack className="" gap={2}>
            {!row.is_finished && row.is_approved && (
              <Stack>
                <span className=" tx-12">
                  Picking-待拣货:{row.statusCounts.picking}
                </span>
                <span className=" tx-12">
                  Picked-已拣货:{row.statusCounts.picked}
                </span>
              </Stack>
            )}
            {row.statusCounts.short > 0 && (
              <span className=" tx-12">
                Short-缺货:{row.statusCounts.short}
              </span>
            )}
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
            {row.warehouse ? (
              <>
                <div className="wd-40 ">
                  {row.warehouse.name} {row.warehouse.description}
                </div>
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
      name: t('dtlb_total'),
      width: '160px',
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
      name: t('dtlb_remarks'),
      selector: (row: any) => [row.paymentremark],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => {}}>
          <Stack>
            <span>{row.print_remark !== '' ? `${row.remark}` : null} </span>

            {row.shortDetails.length > 0 && (
              <>
                <span>Insufficient(缺货):</span>
                {row.shortDetails.map((detail: any) => {
                  return (
                    <Stack>
                      <span>
                        {detail.item.name_localizations.en} SKU:
                        {detail.item.sku}
                      </span>
                      <span>
                        Total:
                        <span style={{ color: 'blue', fontSize: 22 }}>
                          {Number(detail.qty_base).toFixed(0)}
                        </span>
                        Picked:
                        <span style={{ color: 'blue', fontSize: 22 }}>
                          {Number(detail.qty_picked).toFixed(0)}
                        </span>
                        Shortage:
                        <span style={{ color: 'red', fontSize: 22 }}>
                          {Number(detail.qty_shortage).toFixed(0)}
                        </span>
                      </span>
                    </Stack>
                  );
                })}
              </>
            )}

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
