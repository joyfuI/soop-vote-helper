import Container from '@mui/material/Container';

import Navigation from './components/Navigation';
import useStore from './hooks/useStore';
import Overlay from './Overlay';
import Setup from './Setup';
import Vote from './Vote';

const App = () => {
  const [tab, setTab] = useStore('tab', 0);

  return (
    <Container component="main" sx={{ p: 2 }}>
      <Navigation onChange={(_e, newValue) => setTab(newValue)} value={tab}>
        <Setup />
        <Vote />
        <Overlay />
      </Navigation>
    </Container>
  );
};

export default App;
