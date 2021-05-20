import React from 'react';
import {
  Button,
  Container,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  ThemeProvider,
  Typography,
  makeStyles,
} from '@material-ui/core';

import theme from '../../../themes/theme';
import { getAngularService } from '../../../services/angular-react-helper';

const useStyles = makeStyles(() => ({
}));

function ChplLogin(props) {
  console.log(props);
  const $state = getAngularService('$state');
  const classes = useStyles();

  const login = () => {
    console.log('logging in');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Card>
          <CardHeader title="Login required" />
          <CardContent>
            <Typography
              variant="body1"
            >
              Log in here
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              color="primary"
              onClick={login}
            >
              Login
            </Button>
          </CardActions>
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default ChplLogin;
