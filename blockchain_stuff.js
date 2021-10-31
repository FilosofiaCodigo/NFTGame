const NETWORK_ID = 4
var contract
var accounts
var web3
var balance

function metamaskReloadCallback()
{
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Accounts changed, realoading...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Network changed, realoading...";
    window.location.reload()
  })
}

const getAccounts = async () => {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    resolve(web3)
  } catch (error) {
    console.log(error)
  }
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Please install Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

function handleRevertError(message) {
  alert(message)
}

async function getRevertReason(txHash) {
  const tx = await web3.eth.getTransaction(txHash)
  await web3.eth
    .call(tx, tx.blockNumber)
    .then((result) => {
      throw Error("unlikely to happen")
    })
    .catch((revertReason) => {
      var str = "" + revertReason
      json_reason = JSON.parse(str.substring(str.indexOf("{")))
      handleRevertError(json_reason.message)
    });
}

const getContract = async (web3) => {
  const data = await $.getJSON("./contracts/Contract.json")

  const netId = await web3.eth.net.getId()
  const deployedNetwork = data.networks[netId]
  const contract = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
  )
  return contract
}

var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

async function connectWallet() {
  getAccounts()
}

async function loadAccount() {
  accounts = await web3.eth.getAccounts()
  balance = await contract.methods.balanceOf(accounts[0]).call()
  playerBalanceCallback(balance)
  document.getElementById("web3_message").textContent="You have " + balance + " NFTs"
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent="Plase connect to Metamask"
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          contract = await getContract(web3);
          NFT_PRICE = await contract.methods.price().call()
          PRESALE_PRICE = await contract.methods.presale_price().call()
          MAX_PRESALE_SUPPLY = await contract.methods.MAX_PRESALE_SUPPLY().call()
          total_mint = await contract.methods.totalSupply().call()
          web3.eth.getAccounts(function(err, accounts){
            if (err != null)
              console.error("An error occurred: "+err);
            else if (accounts.length == 0)
              console.log("User is not logged in to MetaMask");
            else
            {
              loadAccount()
            }
          });
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Please connect to Rinkeby Testnet";
      }
    });
  };
  awaitWeb3();
}

loadDapp()