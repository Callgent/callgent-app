import { Radar } from '@ant-design/plots';
import { PageContainer } from '@ant-design/pro-components';
import { Link, useRequest } from '@umijs/max';
import { Avatar, Card, Col, List, Row, Skeleton, Statistic } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState, type FC } from 'react';
import type { ActivitiesType, CurrentUser } from './data.d';
import { fakeChartData, queryActivities, queryProjectNotice } from './service';
import useStyles from './style.style';
import { getInitialState } from '@/app';
dayjs.extend(relativeTime);

const PageHeaderContent: FC<{
  currentUser: Partial<CurrentUser>;
}> = ({ currentUser }) => {
  console.log(currentUser);

  const { styles } = useStyles();
  const loading = currentUser && Object.keys(currentUser).length;
  if (!loading) {
    return (
      <Skeleton
        avatar
        paragraph={{
          rows: 1,
        }}
        active
      />
    );
  }
  return (
    <div className={styles.pageHeaderContent}>
      <div className={styles.avatar}>
        <Avatar size="large" src={currentUser.avatar} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentTitle}>
          Good morning,
          {currentUser.name}, have a great day!
        </div>
        <div>
          {currentUser.title} | {currentUser.group}
        </div>
      </div>
    </div>
  );
};

const ExtraContent: FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.extraContent}>
      <div className={styles.statItem}>
        <Statistic title="Projects" value={56} />
      </div>
      <div className={styles.statItem}>
        <Statistic title="Team Rank" value={8} suffix="/ 24" />
      </div>
      <div className={styles.statItem}>
        <Statistic title="Project Visits" value={2223} />
      </div>
    </div>
  );
};

const Workplace: FC = () => {
  const { styles } = useStyles();
  const { loading: projectLoading, data: projectNotice = [] } = useRequest(queryProjectNotice);
  const { loading: activitiesLoading, data: activities = [] } = useRequest(queryActivities);
  const { data } = useRequest(fakeChartData);

  const renderActivities = (item: ActivitiesType) => {
    const events = item.template.split(/@\{([^{}]*)\}/gi).map((key) => {
      if (item[key as keyof ActivitiesType]) {
        const value = item[key as 'user'];
        return (
          <a href={value?.link} key={value?.name}>
            {value.name}
          </a>
        );
      }
      return key;
    });
    return (
      <List.Item key={item.id}>
        <List.Item.Meta
          avatar={<Avatar src={item.user.avatar} />}
          title={
            <span>
              <a className={styles.username}>{item.user.name}</a>
              &nbsp;
              <span className={styles.event}>{events}</span>
            </span>
          }
          description={
            <span className={styles.datetime} title={item.updatedAt}>
              {dayjs(item.updatedAt).fromNow()}
            </span>
          }
        />
      </List.Item>
    );
  };

  const [currentUser, setCurrentUser] = useState({
    avatar: '/logo.svg',
    name: 'Daniel Wu',
    userid: '00000001',
    email: 'antdesign@alipay.com',
    signature: 'Broad-minded and tolerant',
    title: 'Interaction Expert',
    group:
      'Ant Financial - Some Business Group - Some Platform Department - Some Technology Department - UED',
  });

  const userInfo = async () => {
    const info = await getInitialState();
    console.log(info.currentUser);

    const { avatar, name, uuid, email } = info.currentUser;
    setCurrentUser({
      avatar: avatar ? avatar : '/logo.svg',
      name: name,
      userid: uuid,
      email: email,
      signature: '',
      title: 'Interaction Expert',
      group:
        'Ant Financial - Some Business Group - Some Platform Department - Some Technology Department - UED',
    });
  };

  useEffect(() => {
    userInfo();
  }, []);

  return (
    <PageContainer
      content={<PageHeaderContent currentUser={currentUser} />}
      extraContent={<ExtraContent />}
    >
      <Row gutter={24}>
        <Col xl={16} lg={24} md={24} sm={24} xs={24}>
          <Card
            className={styles.projectList}
            style={{
              marginBottom: 24,
            }}
            title="Ongoing Projects"
            bordered={false}
            extra={<Link to="/">All Projects</Link>}
            loading={projectLoading}
            bodyStyle={{
              padding: 0,
            }}
          >
            {projectNotice.map((item) => (
              <Card.Grid className={styles.projectGrid} key={item.id}>
                <Card
                  bodyStyle={{
                    padding: 0,
                  }}
                  bordered={false}
                >
                  <Card.Meta
                    title={
                      <div className={styles.cardTitle}>
                        <Avatar size="small" src={item.logo} />
                        <Link to={item.href || '/'}>{item.title}</Link>
                      </div>
                    }
                    description={item.description}
                  />
                  <div className={styles.projectItemContent}>
                    <Link to={item.memberLink || '/'}>{item.member || ''}</Link>
                    {item.updatedAt && (
                      <span className={styles.datetime} title={item.updatedAt}>
                        {dayjs(item.updatedAt).fromNow()}
                      </span>
                    )}
                  </div>
                </Card>
              </Card.Grid>
            ))}
          </Card>
          <Card
            bodyStyle={{
              padding: 0,
            }}
            bordered={false}
            className={styles.activeCard}
            title="Activities"
            loading={activitiesLoading}
          >
            <List<ActivitiesType>
              loading={activitiesLoading}
              renderItem={(item) => renderActivities(item)}
              dataSource={activities}
              className={styles.activitiesList}
              size="large"
            />
          </Card>
        </Col>
        <Col xl={8} lg={24} md={24} sm={24} xs={24}>
          <Card
            style={{
              marginBottom: 24,
            }}
            bordered={false}
            title="XX Index"
            loading={data?.radarData?.length === 0}
          >
            <div>
              <Radar
                height={343}
                data={data?.radarData || []}
                xField="label"
                colorField="name"
                yField="value"
                shapeField="smooth"
                area={{
                  style: {
                    fillOpacity: 0.4,
                  },
                }}
                axis={{
                  y: {
                    gridStrokeOpacity: 0.5,
                  },
                }}
                legend={{
                  color: {
                    position: 'bottom',
                    layout: { justifyContent: 'center' },
                  },
                }}
              />
            </div>
          </Card>
          <Card
            bodyStyle={{
              paddingTop: 12,
              paddingBottom: 12,
            }}
            bordered={false}
            title="Team"
            loading={projectLoading}
          >
            <div className={styles.members}>
              <Row gutter={48}>
                {projectNotice.map((item) => {
                  return (
                    <Col span={12} key={`members-item-${item.id}`}>
                      <a>
                        <Avatar src={item.logo} size="small" />
                        <span className={styles.member}>{item.member.substring(0, 3)}</span>
                      </a>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Workplace;
