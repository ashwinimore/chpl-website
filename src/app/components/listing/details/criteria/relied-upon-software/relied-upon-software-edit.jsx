import React, { useState } from 'react';
import { arrayOf, func } from 'prop-types';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import {
  Button,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { ChplTextField } from '../../../../util';
import { reliedUponSoftware } from '../../../../../shared/prop-types';

const validationSchema = yup.object({
});

function ChplReliedUponSoftwareEdit(props) {
  /* eslint-disable react/destructuring-assignment */
  const [adding, setAdding] = useState(false);
  const [software, setSoftware] = useState(props.software);
  /* eslint-enable react/destructuring-assignment */

  const formik = useFormik({
    initialValues: {
      name: '',
      version: '',
      certifiedProductNumber: '',
      grouping: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnMount: true,
  });

  const update = (updated) => {
    props.onChange({ key: 'additionalSoftware', data: updated });
  };

  const addNew = () => {
    const updated = [
      ...software,
      {
        name: formik.values.name || null,
        version: formik.values.version || null,
        certifiedProductNumber: formik.values.certifiedProductNumber || null,
        grouping: formik.values.grouping,
        key: (new Date()).getTime(),
      },
    ];
    setSoftware(updated);
    formik.resetForm();
    setAdding(false);
    update(updated);
  };

  const cancelAdd = () => {
    formik.resetForm();
    setAdding(false);
  };

  const removeItem = (item) => {
    const updated = software.filter((s) => !(s.id === item.id && s.key === item.key));
    setSoftware(updated);
    update(updated);
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Typography variant="subtitle2">Name</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle2">Version</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle2">CHPL ID</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2">Group</Typography>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Grid>
      { software.map((item) => (
        <Grid item xs={12} key={item.id || item.key}>
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <Typography variant="subtitle2">{ item.name }</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">{ item.version }</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">{ item.certifiedProductNumber }</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2">{ item.grouping }</Typography>
            </Grid>
            <Grid item xs={1}>
              { !adding
                && (
                <IconButton
                  onClick={() => removeItem(item)}
                >
                  <CloseOutlinedIcon
                    color="primary"
                    size="small"
                  />
                </IconButton>
                )}
            </Grid>
          </Grid>
        </Grid>
      ))}
      { !adding
        && (
        <Grid item xs={12}>
          <Button
            onClick={() => setAdding(true)}
          >
            Add item
          </Button>
        </Grid>
        )}
      { adding
        && (
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <ChplTextField
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!!formik.values.certifiedProductNumber}
                error={formik.touched.name && formik.errors.name}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={6}>
              <ChplTextField
                id="version"
                name="version"
                label="Version"
                value={formik.values.version}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!!formik.values.certifiedProductNumber}
                error={formik.touched.version && formik.errors.version}
                helperText={formik.touched.version && formik.errors.version}
              />
            </Grid>
            <Grid item xs={6}>
              <ChplTextField
                id="certified-product-number"
                name="certifiedProductNumber"
                label="Certified Product Number"
                value={formik.values.certifiedProductNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!!(formik.values.name || formik.values.version)}
                error={formik.touched.certifiedProductNumber && formik.errors.certifiedProductNumber}
                helperText={formik.touched.certifiedProductNumber && formik.errors.certifiedProductNumber}
              />
            </Grid>
            <Grid item xs={4}>
              <ChplTextField
                id="grouping"
                name="grouping"
                label="Grouping"
                value={formik.values.grouping}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.grouping && formik.errors.grouping}
                helperText={formik.touched.grouping && formik.errors.grouping}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                color="primary"
                variant="outlined"
                onClick={addNew}
              >
                <CheckOutlinedIcon />
              </Button>
              <IconButton
                onClick={() => cancelAdd()}
              >
                <CloseOutlinedIcon
                  color="primary"
                  size="small"
                />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        )}
    </Grid>
  );
}

export default ChplReliedUponSoftwareEdit;

ChplReliedUponSoftwareEdit.propTypes = {
  onChange: func.isRequired,
  software: arrayOf(reliedUponSoftware).isRequired,
};
