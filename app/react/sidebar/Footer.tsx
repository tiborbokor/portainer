import { useState } from 'react';
import { useQuery } from 'react-query';
import { DialogOverlay } from '@reach/dialog';
import { Database, Hash, Server, Tag, Tool } from 'react-feather';
import clsx from 'clsx';

import smallLogo from '@/assets/images/logo_small.png';
import { getStatus } from '@/portainer/services/api/status.service';

import { UpdateNotification } from './UpdateNotifications';
import styles from './Footer.module.css';

import { Button } from '@@/buttons';

import '@reach/dialog/styles.css';

export function Footer() {
  const [showBuildInfo, setShowBuildInfo] = useState(false);
  const statusQuery = useStatus();

  if (!statusQuery.data) {
    return null;
  }

  const status = {
    serverVersion: '2.13.0',
    dbVersion: '35',
    ciBuildNumber: '17478',
    imageTag: 'portainer/portainer-ee:latest',
    nodeVersion: '14.2.4',
    yarnVersion: '0.12.5',
    webpackVersion: '1.15.4',
    goVersion: '1.18.0',
  };

  const { Edition, Version } = statusQuery.data;

  return (
    <>
      {showBuildInfo && (
        <DialogOverlay className={styles.dialog}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowBuildInfo(!showBuildInfo)}
                >
                  ×
                </button>
                <h5 className="modal-title">Portainer {Edition}</h5>
              </div>
              <div className="modal-body">
                <div className={styles.versionInfo}>
                  <table>
                    <tr>
                      <td>
                        <span className="inline-flex items-center">
                          <Server size="13" className="space-right" />
                          Server Version: {status.serverVersion}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center">
                          <Database size="13" className="space-right" />
                          Database Version: {status.dbVersion}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="inline-flex items-center">
                          <Hash size="13" className="space-right" />
                          CI Build Number: #{status.ciBuildNumber}
                        </span>
                      </td>
                      <td>
                        <span>
                          <Tag size="13" className="space-right" />
                          Image Tag: {status.imageTag}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
                <div className={styles.toolsList}>
                  <span className="inline-flex items-center">
                    <Tool size="13" className="space-right" />
                    Compilation tools:
                  </span>

                  <div className={styles.tools}>
                    <span className="text-muted small">
                      Nodejs v{status.nodeVersion}
                    </span>
                    <span className="text-muted small">
                      Yarn v{status.yarnVersion}
                    </span>
                    <span className="text-muted small">
                      Webpack v{status.webpackVersion}
                    </span>
                    <span className="text-muted small">
                      Go v{status.goVersion}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button onClick={() => setShowBuildInfo(!showBuildInfo)}>
                  Ok
                </Button>
              </div>
            </div>
          </div>
        </DialogOverlay>
      )}
      <div className={styles.root}>
        {process.env.PORTAINER_EDITION === 'CE' && <UpdateNotification />}
        <div>
          <img
            src={smallLogo}
            className={clsx('img-responsive', styles.logo)}
            alt="Portainer"
          />
          <span
            className={styles.version}
            data-cy="portainerSidebar-versionNumber"
            onClick={() => {
              setShowBuildInfo(!showBuildInfo);
            }}
          >
            {Version}
          </span>
          {process.env.PORTAINER_EDITION !== 'CE' && (
            <div className={styles.editionVersion}>{Edition}</div>
          )}
        </div>
      </div>
    </>
  );
}

function useStatus() {
  return useQuery(['status'], () => getStatus());
}
