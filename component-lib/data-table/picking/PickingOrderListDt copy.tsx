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
  const { orderListData, setPickingOrderId } = props;

  const routes = useRouter();
  const [_edit, setEditItem] = useAtom(editItemAtom);
  const [_, setDeleteOrderId] = useAtom(deleteOrderIdAtom);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const handleRowSelected = (state: any) => {
    setSelectedRows(state.selectedRows);
  };

  const handleBatchProcess = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one row to process.');
      return;
    }
    // Add your batch processing logic here
  };

  const columnsItemList = [
    {
      name: '',
      width: '50px',
      cell: (row: any) => (
        <input
          type="checkbox"
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
      name: 'OrderInfo',
      width: '300px',
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
            </div>
            <span>
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
                {row.outboundOrderDetail.length}
              </span>{' '}
            </span>
            <span className="text-secondary tx-16 tx-medium">
              {row.vendor.name}
            </span>
            <span>
              Outbound: <span className="tx-medium">{row.outbound_date}</span> ,
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
                  Not Approved
                </span>
              )}
            </div>
            <div className="wd-40 ">
              {row.status === 2 && (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Picking...
                </span>
              )}

              {row.is_finished && (
                <span className="mg-l-2 badge bg-warning badge-pill me-1 tx-12">
                  Finished
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
      width: '80px',
      sortable: false,
      cell: (row: any) => {
        return (
          !row.is_approved && (
            <div className="">
              <IconButton
                color="primary"
                aria-label="Delete"
                onClick={() => {}}
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
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleBatchProcess}
        style={{ marginBottom: '10px' }}
      >
        Process Selected
      </Button>
      <span className="datatable">
        {orderListData?.data?.length > 0 && (
          <DataTable
            title=""
            //@ts-ignore
            columns={columnsItemList}
            data={orderListData.data}
            fixedHeader
            selectableRows
            onSelectedRowsChange={handleRowSelected}
            customStyles={customStylesForDataTable}
          />
        )}
      </span>
    </div>
  );
}
