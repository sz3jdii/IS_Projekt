import React from "react";
import styled from "styled-components";
import { useTable, usePagination } from "react-table";
import { exportFile } from 'fs-browsers';

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }

      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, 
}) => {
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    updateMyData(index, id, value);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

const defaultColumn = {
  Cell: EditableCell,
};

function Table({ columns, data, updateMyData, skipPageReset }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetPage: !skipPageReset,
      updateMyData,
    },
    usePagination
  );

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Integracja Systemów - Adam Świątkowski",
        columns: [
          {
            Header: 'Producent',
            accessor: 'producent' 
          },
          {
            Header: 'Przekątna ekranu',
            accessor: 'screenDiagonal' 
          },
          {
            Header: 'Rozdzielczość ekranu',
            accessor: 'screenResolution' 
          },
          {
            Header: 'Typ powierzchni ekranu',
            accessor: 'screenSurfaceType' 
          },
          {
            Header: 'Ekran dotykowy',
            accessor: 'isTouchScreen' 
          },
          {
            Header: 'Procesor',
            accessor: 'CPUName' 
          },
          {
            Header: 'Ilość rdzeni procesora',
            accessor: 'CPUCores' 
          },
          {
            Header: 'Taktowanie procesora',
            accessor: 'CPUTiming' 
          },
          {
            Header: 'Ilość pamięci RAM',
            accessor: 'RAMSize' 
          },
          {
            Header: 'Rozmiar dysku',
            accessor: 'diskSize' 
          },
          {
            Header: 'Typ dysku',
            accessor: 'diskType' 
          },
          {
            Header: 'Karta graficzna',
            accessor: 'GPUName' 
          },
          {
            Header: 'Ilość pamięci karty graficznej',
            accessor: 'GPUMemory' 
          },
          {
            Header: 'System operacyjny',
            accessor: 'OSName' 
          },
          {
            Header: 'Typ napędu optycznego',
            accessor: 'physicalDriveType' 
          }
        ],
      },
    ],
    []
  );

  const [data, setData] = React.useState([]);
  const [skipPageReset, setSkipPageReset] = React.useState(false);

  const updateMyData = (rowIndex, columnId, value) => {
    setSkipPageReset(true);
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  React.useEffect(() => {
    setSkipPageReset(false);
  }, [data]);


  const storeData = () => {
    if(data.length !== 0){
      let txtFileContent = '';
      for(const product of data){
        txtFileContent = txtFileContent+
        product.producent+';'+
        product.screenDiagonal+';'+
        product.screenResolution+';'+
        product.screenSurfaceType+';'+
        product.isTouchScreen+';'+
        product.CPUName+';'+
        product.CPUCores+';'+
        product.CPUTiming+';'+
        product.RAMSize+';'+
        product.diskSize+';'+
        product.diskType+';'+
        product.GPUName+';'+
        product.GPUMemory+';'+
        product.OSName+';'+
        product.physicalDriveType+';\n';
      }
      exportFile(txtFileContent, { fileName: 't2_katalog.txt' });
    }else{
      alert('Załaduj najpierw plik źródłowy!');
    }
  };

  const loadData = (event) => {
    if(event.target.value.length !== 0){
      setData([]);
      const data = [];
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function() {
        const fileContent = reader.result.split('\n');
        for(const fileLine of fileContent){
          const fileField = fileLine.split(';');
          const product = {
            producent: fileField[0],
            screenDiagonal: fileField[1],
            screenResolution: fileField[2],
            screenSurfaceType: fileField[3],
            isTouchScreen: fileField[4],
            CPUName: fileField[5],
            CPUCores: fileField[6],
            CPUTiming: fileField[7],
            RAMSize: fileField[8],
            diskSize: fileField[9],
            diskType: fileField[10],
            GPUName: fileField[11],
            GPUMemory: fileField[12],
            OSName: fileField[13],
            physicalDriveType: fileField[14],
          };
          data.push(product);
        }
        setData(data);
      }
    }
  };

  return (
    <Styles>
      <input type="file" onChange={loadData}/>
      <button onClick={storeData}>Zapisz dane do pliku TXT</button>
      <Table
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
      />
    </Styles>
  );
}

export default App;
