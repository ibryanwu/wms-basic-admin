import { Button, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  deleteOrderIdAtom,
  editItemAtom,
  itemListAtom,
  openPurItemDrawerAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from '@mui/joy';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import {
  orderTypeOptions,
  outboundDetailStatusOptions,
} from '@/service/outbound';
import { useTranslation } from 'react-i18next';

const customStylesForDataTable = {
  rows: {
    style: {
      '&:hover': {
        backgroundColor: '#f2f8ff',
      },
      paddingTop: '5px',
      paddingBottom: '5px',
      maxHeight: '400px',
      overflowY: 'auto',
    },
  },
};

export default function OutboundPickingOrderListDataTable(props: any) {
  const { t } = useTranslation('picking_list');
  const { orderListData, setPickingOrderId, setBulkPickingOrderIds } = props;

  const routes = useRouter();
  const [_edit, setEditItem] = useAtom(editItemAtom);
  const [_, setDeleteOrderId] = useAtom(deleteOrderIdAtom);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const handleRowSelected = (state: any) => {
    setSelectedRows(state.selectedRows);
  };

  const handleBatchProcess = () => {
    if (selectedRows.length === 0) {
      toast.warning(t('toast_select_row'));
      return;
    }

    const selectedOrderIds: any = [];
    selectedRows.map((order) => {
      selectedOrderIds.push(order.id);
    });

    setBulkPickingOrderIds(selectedOrderIds);
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(orderListData.data);
    }
    setIsAllSelected(!isAllSelected);
  };

  const columnsItemList = [
    {
      name: '',
      width: '50px',
      cell: (row: any) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows((prev) => [...prev, row]);
            } else {
              setSelectedRows((prev) => prev.filter((r) => r.id !== row.id));
            }
          }}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: '#',
      width: '3%',
      selector: (row: any) => row.rowNumber,
      cell: (row: any, index: number) => index + 1,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: t('dtlb_order_info'),
      width: '400px',
      selector: (row: any) => [row.invoice_no],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setPickingOrderId(row.id);
          }}
        >
          <Stack>
            <div>
              Order#:
              <span className={`mg-l-4 mg-r-4 tx-primary tx-16`}>
                <mark>{row.order_no}</mark>
              </span>
              <span>
                Items:
                <span className=" mg-l-4 mg-r-4 tx-16 tx-medium">
                  {row.statusCounts.picked}/{row.outboundOrderDetail.length}
                </span>{' '}
              </span>
            </div>

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
              {row.statusCounts.picked !== row.outboundOrderDetail.length ? (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Picking...
                </span>
              ) : (
                <span
                  className="mg-l-2 badge badge-pill me-1 tx-12"
                  style={{ backgroundColor: 'black' }}
                >
                  {row.statusCounts.short === 0
                    ? t('dtlb_all_picked')
                    : t('dtlb_partial_picked')}
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
            {row.statusCounts.picking > 0 && (
              <span className=" tx-12">
                Picking-待拣货:{row.statusCounts.picking}
              </span>
            )}
            {row.statusCounts.short > 0 && (
              <span className=" tx-12">
                Short-缺货:{row.statusCounts.short}
              </span>
            )}
            {row.statusCounts.picked > 0 && (
              <span className=" tx-12">
                Picked-已拣货:{row.statusCounts.picked}
              </span>
            )}
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_warehouse'),
      width: '300px',
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
  ];

  return (
    <div>
      <Stack direction="row" gap={3} style={{ marginBottom: '10px' }}>
        <div className="m-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAllToggle}
          />
          <span className="mg-l-10">Select All</span>
        </div>

        <Button
          variant="contained"
          color="primary"
          onClick={handleBatchProcess}
        >
          {t('btn_bulk_picking')}
        </Button>
      </Stack>
      <span className="datatable">
        {orderListData?.data?.length > 0 && (
          <DataTable
            title=""
            //@ts-ignore
            columns={columnsItemList}
            data={orderListData.data}
            fixedHeader
            // selectableRows
            onSelectedRowsChange={handleRowSelected}
            customStyles={customStylesForDataTable}
          />
        )}
      </span>
    </div>
  );
}
