import { Button, Divider, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  openInUseOrEmptyBinListDrawerAtom,
  openZoneModalAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { UnitDialog } from '@/component-lib/modal/meta/UnitDialog';
import { ZoneDialog } from '@/component-lib/modal/meta/ZoneDialog';
import { getShelvesByZone } from '@/service/location';
import { Container, Row, Col } from 'react-bootstrap';
import {
  useGetAllBinsByZone,
  useGetEmptyBinsByZone,
  useGetNonEmptyBinsByZone,
} from '@/rest/location';
import InUseOrEmptyBinListDrawer from '@/component-lib/modal/drawer/InUseOrEmptyBinListDrawer';

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

const conditionalRowStyles = [];

export default function ZoneListDataTable(props: any) {
  const {
    data,
    warehouseId,
    setCurrentTab,
    setCurrentZone,
    setShelfData,
    locationData,
  } = props;
  //

  // Values  -------------------------------------------------
  const [_open, setOpenModal] = useAtom(openZoneModalAtom);

  // Atoms ---------------------------------------------------
  const [_, setOpenInUseOrEmptyBinListDrawer] = useAtom(
    openInUseOrEmptyBinListDrawerAtom,
  );
  // UseState  -----------------------------------------------
  const [editItem, setEditItem] = useState(undefined);
  const [emptyBin, setEmptyBin] = useState(''); //empty | non | all

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const {
    mutate: getEmptyBinsByZone,
    data: emptyBinList,
    isLoading: isLoadingEmptyBinList,
    serverError: emptyBinListDataError,
  } = useGetEmptyBinsByZone();
  const {
    mutate: getNonEmptyBinsByZone,
    data: nonEmptyBinList,
    isLoading: isLoadingNonEmptyBinList,
    serverError: nonEmptyBinListError,
  } = useGetNonEmptyBinsByZone();
  const {
    mutate: getAllBinsByZone,
    data: allBinList,
    isLoading: isLoadingAllBinList,
    serverError: allBinListError,
  } = useGetAllBinsByZone();
  // Use Effect  ---------------------------------------------
  // Function ------------------------------------------------

  useEffect(() => {
    if (emptyBinList?.code === 0) {
      setOpenInUseOrEmptyBinListDrawer(true);
    }
  }, [emptyBinList]);
  useEffect(() => {
    if (nonEmptyBinList?.code === 0) {
      setOpenInUseOrEmptyBinListDrawer(true);
    }
  }, [nonEmptyBinList]);
  useEffect(() => {
    if (allBinList?.code === 0) {
      setOpenInUseOrEmptyBinListDrawer(true);
    }
  }, [allBinList]);

  //
  const columnsItemList = [
    {
      name: '#',
      width: '60px',
      selector: (row: any) => row.rowNumber,
      cell: (row: any, index: number) => {
        return (
          <span>
            {index + 1}
            <span className=" tx-white">
              <br></br>
              {row.sort_index}
            </span>
          </span>
        );

        // return ;
      }, // index 从 0 开始，所以加 1
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: 'Name',
      width: '160px',
      selector: (row: any) => [row.name],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          <Stack direction="vertical" gap={1}>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEditItem(row);
                setOpenModal(true);
              }}
            >
              <u>
                <span className="tx-medium tx-15">{row.name}</span>
              </u>
            </div>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Bin Occupied',
      width: '300px',
      selector: (row: any) => [row.location],
      sortable: false,
      cell: (row: any) => (
        <Container>
          <Row className="w-100 text-center">
            <Col
              style={{ cursor: 'pointer' }}
              className="d-flex flex-column align-items-center"
              onClick={() => {
                setEmptyBin('all');
                getAllBinsByZone({ zoneId: row.id });
              }}
            >
              <u>
                <span className="tx-medium tx-15">{row.binTotalCount}</span>
              </u>
              <div>TotalBin</div>
            </Col>
            <Col
              style={{ cursor: 'pointer' }}
              className="d-flex flex-column align-items-center"
              onClick={() => {
                setEmptyBin('non');
                getNonEmptyBinsByZone({ zoneId: row.id });
              }}
            >
              <u>
                <span className="tx-medium tx-15">{row.binNonEmptyCount}</span>
              </u>
              <div>InUse</div>
            </Col>
            <Col
              style={{ cursor: 'pointer' }}
              className="d-flex flex-column align-items-center"
              onClick={() => {
                setEmptyBin('empty');
                getEmptyBinsByZone({ zoneId: row.id });
              }}
            >
              <u>
                <span className="tx-medium tx-15">{row.binEmptyCount}</span>
              </u>
              <div>Empty</div>
            </Col>
          </Row>
        </Container>
      ),
    },
    {
      name: 'Storage Type',
      width: '160px',
      selector: (row: any) => [row.storageType],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>{row.storageType}</div>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Description',
      width: '200px',
      selector: (row: any) => [row.description],
      sortable: false,
      cell: (row: any, index: number) => <div>{row.description}</div>,
    },

    {
      name: 'Capacity',
      width: '100px',
      selector: (row: any) => [row.capacity],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>{row.capacity}</div>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Shelves',
      width: '100px',
      selector: (row: any) => [row.location],
      sortable: false,
      cell: (row: any) => (
        <div
          className=""
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setCurrentTab('shelf');
            setCurrentZone({ id: row.id, name: row.name });
            setShelfData(getShelvesByZone(row.id, data));
          }}
        >
          <Stack direction="vertical" gap={1}>
            <u>
              <span className="tx-medium tx-15">{row.shelves.length}</span>
            </u>
          </Stack>
        </div>
      ),
    },

    {
      name: 'Active',
      width: '100px',
      selector: (row: any) => [row.isActive],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <div className="wd-40">
            {row.isActive ? (
              <span className="badge bg-warning badge-pill me-1 ">Active</span>
            ) : (
              <span className="badge bg-gray-500 badge-pill me-1 ">
                Inactive
              </span>
            )}
          </div>
        </div>
      ),
    },

    // {
    //   name: 'Op',
    //   width: '100px',
    //   sortable: false,
    //   cell: (row: any) => (
    //     <div className="">
    //       <IconButton color="warning" aria-label="Delete" onClick={() => {}}>
    //         <DeleteForever />
    //       </IconButton>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div>
      {emptyBin && emptyBin === 'empty' && emptyBinList?.data && (
        <InUseOrEmptyBinListDrawer data={emptyBinList?.data} title="Empty" />
      )}
      {emptyBin && emptyBin === 'non' && nonEmptyBinList?.data && (
        <InUseOrEmptyBinListDrawer data={nonEmptyBinList?.data} title="InUse" />
      )}
      {emptyBin && emptyBin === 'all' && allBinList?.data && (
        <InUseOrEmptyBinListDrawer data={allBinList?.data} title="All" />
      )}
      <UnitDialog
        editingItem={editItem}
        showAddBt={false}
        setEditItem={setEditItem}
      />
      <ZoneDialog
        editingItem={editItem}
        showAddBt={true}
        setEditItem={setEditItem}
        warehouseId={warehouseId}
      />
      <span className="datatable">
        {data?.length > 0 && (
          <DataTable
            title=""
            //@ts-ignore
            columns={columnsItemList}
            data={data}
            // fixedHeader
            pagination={false}
            customStyles={customStylesForDataTable}
            //conditionalRowStyles={conditionalRowStyles}
          />
        )}
      </span>
    </div>
  );
}
