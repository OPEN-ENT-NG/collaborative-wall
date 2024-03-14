import http from 'k6/http';
import { check } from 'k6';
import chai, { describe } from 'https://jslib.k6.io/k6chaijs/4.3.4.2/index.js';
import {
    authenticateWeb, 
    getHeaders, 
    getSchoolByName,
    getUsersOfSchool,
    createStructure,
    createAndSetRole,
    linkRoleToUsers,
    activateUsers,
    getRolesOfStructure
} from 'https://raw.githubusercontent.com/juniorode/edifice-k6-commons/develop/dist/index.js';
import { WebSocket } from 'k6/experimental/websockets';
import { setTimeout, setInterval, clearInterval } from 'k6/experimental/timers';
import { Trend } from 'k6/metrics';
import { createRandomWallMessage } from './messages.js';
import { createReport } from './report.js';

const rootUrl = __ENV.ROOT_URL;
const maxDuration = __ENV.MAX_DURATION || '1m';
const delayBeforeSend = parseInt(__ENV.DELAY_BEFORE_SEND || '3000');
const nbUsers = parseInt(__ENV.NB_USERS || '10');
const schoolName = __ENV.DATA_SCHOOL_NAME || "Tests Collaborative Wall 3"
const dataRootPath = __ENV.DATA_ROOT_PATH;
const NB_MESSAGES = parseInt(__ENV.NB_MESSAGES || '10');
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || '2s');
const userTimeToLiveInMs = parseInt(__ENV.USER_TTL);
const checkNumberOfMessages = 'true' === __ENV.CHECK_NB_MESSAGES_RCV

//const nbExpectedMEssages = 2 * nbUsers + NB_MESSAGES * (nbUsers - 1)
const nbExpectedMEssages = NB_MESSAGES * (nbUsers - 1)
chai.config.logFailures = true;

const timeToConnect = new Trend("time_to_first_ws_message", true, {custom: true});
const timeToMessageReception = new Trend("message_broadcast_time", true, {custom: true});

export const options = {
  setupTimeout: '1h',
  thresholds: {
    checks: ['rate == 1.00'],
  },
  scenarios: {
    wss: {
        executor: 'shared-iterations',
        vus: nbUsers,
        iterations: nbUsers,
        maxDuration: maxDuration,
        gracefulStop
    }
  }
};

const teacherData = open(`${dataRootPath}/enseignants.csv`, 'b')

export function setup() {
  const wallId = initViewsData(schoolName, teacherData)
  const session = authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
  const school = getSchoolByName(schoolName, session)
  const users = getUsersOfSchool(school, session)
  return {users, wallId};
}


export default (data) => {
    const {users, wallId} = data;
    const user = users[Math.floor(Math.random() * users.length)]
    startWSSession(wallId, user)
}

function startWSSession(wallId, user) {
    if(wallId) {
        const session = authenticateWeb(user.login, "password");
        const params = {headers: getHeaders(session)}
        const start = Date.now();
        let first = true;
        const ws = new WebSocket(`${getWsUrl(rootUrl)}/collaborativewall/${wallId}`, null, params);
        let report = createReport()
        ws.addEventListener('message', (data) => {
            const payload = JSON.parse(data.data)
            console.debug('Message received: ', user.login, ' - ', payload.type);
            if(first && payload.type === 'connection' && payload.userId === user.id) { // May not be true as we can reuse the same user
                first = false;
                console.debug("Adding timeToConnect")
                timeToConnect.add(Date.now() - start);
            } else {
                console.debug("Adding timeToMessageReception")
                timeToMessageReception.add(Date.now() - payload.emittedAt)
            }
            report.onReceivedMessage(payload)
            if(report.countReceivedMessages === nbExpectedMEssages) {
                ws.close()
            }
        });
        ws.addEventListener("error", (data)=>{
            console.error(data)
        })
        ws.addEventListener('close', (data) => {
            console.debug("Closed")
            check(report.countSentMessages, {
                'has sent enough messages': (val) => val === NB_MESSAGES
            })
            if(checkNumberOfMessages) {
                check(nbReceivedMessages, {
                    'has received enough messages': (val) => {
                        return val === nbExpectedMEssages
                    }
                })
            }
        });
        ws.addEventListener('open', () => {
            console.info("Opened connection")
            setTimeout(() => {
                console.debug("Sending")
                for(let i = 0; i < NB_MESSAGES; i++) {
                    let payload = createRandomWallMessage(user, wallId)
                    ws.send(JSON.stringify(payload));
                    report.onSentMessage(payload);
                }
                setTimeout(() => {
                    ws.close()
                }, userTimeToLiveInMs)
            }, delayBeforeSend)
            
        });
    }
}


function initViewsData(schoolName, teacherData) {
    const session = authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    let wallId;
    describe("[CollaborativeWall] Init - Initialize collaborativewall data", () => {
        const structure = createStructure(schoolName, teacherData, session);
        const role = createAndSetRole('CollaborativeWall', session);
        linkRoleToUsers(structure, role, [], session);
        activateUsers(structure, session);
        wallId = createWall(structure, session);
    });
    return wallId
}

function createWall(structure, adminSession) {
    let res = http.get(`${rootUrl}/directory/structure/${structure.id}/users`, { headers: getHeaders(adminSession) })
    check(res, {
        'fetch structure users': (r) => r.status == 200
    })
    const users = JSON.parse(res.body);
    const roles = getRolesOfStructure(structure.id, adminSession);
    const groupIds = roles.map(role => role.id);
    const user = users[0];
    const userSession = authenticateWeb(user.login, 'password');
    const headers = getHeaders(userSession);
    headers['content-type'] = 'application/json';
    const payload = JSON.stringify({
        name: "Stress Test - Mur Collab - " + Date.now(),
        description: "Description du mur collab",
        background: "/collaborativewall/public/img/default.jpg",
        icon: ""
    });
    res = http.post(`${rootUrl}/collaborativewall`, payload, {headers})
    check(res, {
    'create collaborative wall': (r) => r.status === 200
    })
    const wallId = JSON.parse(res.body)['_id']
    const groups = {}
    groupIds.forEach(groupId => groups[groupId] = ["net-atos-entng-collaborativewall-controllers-CollaborativeWallController|getNote","net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieveAllNotes","net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieve","net-atos-entng-collaborativewall-controllers-CollaborativeWallController|updateNote","net-atos-entng-collaborativewall-controllers-CollaborativeWallController|deleteNote","net-atos-entng-collaborativewall-controllers-CollaborativeWallController|createNote"])
    const sharePayload = {
        bookmarks: {},
        groups: groups
    };
    res = http.put(`${rootUrl}/collaborativewall/share/resource/${wallId}`, JSON.stringify(sharePayload), {headers: getHeaders(userSession)})
    check(res, {
        'share wall': (r) => r.status === 200
    })
    
    return wallId
}



function getWsUrl(httpUrl) {
    const url = extractHostname(httpUrl)
    return `ws://${url}:9091`;
}

function extractHostname(url) {
    let hostname = (url.indexOf("://") > -1) ? url.split('/')[2] : url.split('/')[0];
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    return hostname;
}
