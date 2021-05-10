import React, { useState } from 'react';
import { arrayOf, func } from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import {
  Button,
  ButtonGroup,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { ChplTextField } from '../../../../util';
import { testFunctionality, selectedTestFunctionality } from '../../../../../shared/prop-types';

const useStyles = makeStyles(() => ({
  container: {
    display: 'grid',
    gap: '8px',
  },
  dataEntry: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '4px',
  },
  dataEntryActions: {
    alignSelf: 'center',
    justifySelf: 'center',
  },
  dataEntryAddNew: {
    gridColumn: '1 / -1',
  },
}));

const validationSchema = yup.object({
});

function ChplTestFunctionalityEdit(props) {
  /* eslint-disable react/destructuring-assignment */
  const [adding, setAdding] = useState(false);
  const [testFunctionalityUsed, setTestFunctionalityUsed] = useState(props.testFunctionality.sort((a, b) => (a.name < b.name ? -1 : 1)));
  const [options, setOptions] = useState(props.options.filter((option) => props.testFunctionality.filter((used) => used.testFunctionalityId === option.id).length === 0));
  const classes = useStyles();
  /* eslint-enable react/destructuring-assignment */

  const formik = useFormik({
    initialValues: {
      tf: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnMount: true,
  });

  const update = (updated) => {
    props.onChange({ key: 'testFunctionality', data: updated });
  };

  const addNew = () => {
    const updated = [
      ...testFunctionalityUsed,
      {
        description: formik.values.tf.description,
        id: undefined,
        name: formik.values.tf.name,
        testFunctionalityId: formik.values.tf.id,
        key: Date.now(),
      },
    ];
    setTestFunctionalityUsed(updated);
    setOptions(options.filter((option) => option.id !== formik.values.tf.id));
    formik.resetForm();
    setAdding(false);
    update(updated);
  };

  const cancelAdd = () => {
    formik.resetForm();
    setAdding(false);
  };

  const removeItem = (item) => {
    const updated = testFunctionalityUsed.filter((used) => used.testFunctionalityId !== item.testFunctionalityId);
    setTestFunctionalityUsed(updated);
    setOptions([...options, {
      ...item,
      id: item.testFunctionalityId,
    }]);
    update(updated);
  };

  return (
    <Container className={classes.container}>
      { testFunctionalityUsed.length > 0
        && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                { testFunctionalityUsed.map((item) => (
                  <TableRow key={item.id || item.key}>
                    <TableCell>
                      <Typography variant="subtitle2">{ item.name }</Typography>
                    </TableCell>
                    <TableCell align="right">
                      { !adding
                        && (
                          <IconButton
                            onClick={() => removeItem(item)}
                          >
                            <CloseIcon
                              color="primary"
                              size="small"
                            />
                          </IconButton>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      <div className={classes.dataEntry}>
        { !adding && options.length > 0
          && (
            <div className={classes.dataEntryAddNew}>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => setAdding(true)}
              >
                Add item
                {' '}
                <AddIcon />
              </Button>
            </div>
          )}
        { adding
          && (
            <>
              <ChplTextField
                select
                id="tf"
                name="tf"
                label="Functionality Tested"
                value={formik.values.tf}
                onChange={formik.handleChange}
              >
                { options.map((item) => (
                  <MenuItem value={item} key={item.id}>{item.name}</MenuItem>
                ))}
              </ChplTextField>
              <ButtonGroup
                color="primary"
                className={classes.dataEntryActions}
              >
                <Button
                  onClick={addNew}
                >
                  <CheckIcon />
                </Button>
                <Button
                  onClick={() => cancelAdd()}
                >
                  <CloseIcon />
                </Button>
              </ButtonGroup>
            </>
          )}
      </div>
    </Container>
  );
}

export default ChplTestFunctionalityEdit;

ChplTestFunctionalityEdit.propTypes = {
  testFunctionality: arrayOf(selectedTestFunctionality).isRequired,
  options: arrayOf(testFunctionality).isRequired,
  onChange: func.isRequired,
};
