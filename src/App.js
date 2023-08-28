import './App.css';
import { useEffect, useState } from 'react';
import votingContract from './ethereum/utils'
import { ethers } from "ethers"
import Navbar from './components/Navbar';
function App() {

  // states belong to smart contract
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [smartContract, setSmartContract] = useState();


  //states belong to voters
  const [voterError, setVoterError] = useState("");
  const [voterSuccess, setVoterSuccess] = useState("");
  const [voterVoteHash, setVoterVoteHash] = useState("")
  const [allCandidates, setAllCandidates] = useState([])


  //states belong to canidates
  const [candidateError, setCandidateError] = useState("");
  const [candidateSuccess, setCandidateSuccess] = useState("");
  const [candidateRegistrationHash, setCandidateRegistrationHash] = useState("")

  // Candidate Registration states
  const [candidateName, setCandidateName] = useState("")
  const [party, setParty] = useState("")
  const [constituency, setConstituency] = useState("")

  // Form listener Methods
  const candidateNameChangeListener = (e) => {
    setCandidateName(e.target.value);
  }

  const partyNameChangeListner = (e) => {
    setParty(e.target.value)
  }

  const constituencyChangeListener = (e) => {
    setConstituency(e.target.value)
  }


  // Candidate Registration
  const registerCandidate = async (event) => {
    event.preventDefault();
    const date = new Date()
    const candidateDetails = {
      "id": date.getTime(),
      "name": candidateName,
      "party": party,
      "constituency": constituency,
      "votes": 0
    }
    console.log(candidateDetails);
    setCandidateError("")
    setCandidateSuccess("")
    try {
      const votingContractSigner = smartContract.connect(signer)
      const resp = await votingContractSigner.addCandidate(candidateDetails)
      setCandidateSuccess("Congratulations Registered for the upcoming elections")
      setCandidateRegistrationHash(resp.hash);
    } catch (err) {
      console.log(err)
      setCandidateError(err.message)
    }
  }


  //get All candidates
  const getAllCandidates = async () => {
    try {
      const votingContractSigner = smartContract.connect(signer)
      const count = await votingContractSigner.getLengthOfCandidates()
      const temp = []
      for (let i = 0; i < count; i++) {
        const candidate = await votingContractSigner.candidates(i)
        const candidateFilter = {
          "name": candidate.name,
          "id": candidate.id._hex,
          "party": candidate.party,
          "constituency": candidate.constituency,
          "votes": candidate.votes._hex
        };
        temp.push(candidateFilter)
      }
      setAllCandidates(temp)

      // setAllCandidates(resp);

    } catch (err) {
      // setError(err.message)
      console.error(err.message)
    }
  }

  useEffect(() => {
    getCurrentWalletConnected()
    addWalletListener()
    getAllCandidates()
  }, [])

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_requestAccounts", []);
        /* get signer */
        setSigner(provider.getSigner());
        /* local contract instance */
        setSmartContract(votingContract(provider));
        /* set active wallet address */
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          /* get signer */
          setSigner(provider.getSigner());
          /* local contract instance */
          setSmartContract(votingContract(provider));
          /* set active wallet address */
          setWalletAddress(accounts[0]);

        } else {
          console.log("Connect to MetaMask using the Connect Wallet button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  return (
    <>
      <Navbar />

      {!walletAddress && <div className="container d-flex flex-column flex-wrap justify-content-center align-items-center p-2">
        <h1 className="display-1 m-2">Connect Your Wallet</h1>
        <button className='btn btn-primary m-2' onClick={connectWallet}>{walletAddress ? walletAddress.substring(0, 6) + "..." + walletAddress.substring(
          walletAddress.length - 6, walletAddress.length
        ) : "Connect wallet"}</button>
      </div>}


      <p className='m-2 display-6'>Your wallet address :
        <br />
        <strong>
          {walletAddress}
        </strong>
      </p>

      {/* Candidate Section */}

      <section className="container d-flex flex-column flex-wrap justify-content-center align-items-center" id='registerCandidate'>
        <h1 className='display-1 '>Candidate Registration</h1>

        <div className="container d-flex flex-column flex-wrap align-items-center justify-content-center">
          {candidateError && (
            <div className="alert alert-danger text-danger">{candidateError}</div>
          )}
          {candidateSuccess && (
            <div className="alert alert-success text-success">{candidateSuccess}</div>
          )}{" "}
          <form>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">Candidate Name</label>
              <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required onChange={candidateNameChangeListener} />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">Current Representing Party</label>
              <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required onChange={partyNameChangeListner} />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">Current Representing Constituency</label>
              <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required onChange={constituencyChangeListener} />
            </div>
            <button type="submit" className="btn btn-primary" onClick={registerCandidate}>Submit</button>
          </form>
        </div>
        <div className='display-6 m-2'>Candidate Registration Hash :
          <br />
          <strong>

            {candidateRegistrationHash}
          </strong>
        </div>
      </section>

      {/* Voters Section */}

      <section className='container d-flex flex-column flex-wrap align-items-center justify-content-center'>
        <h1 className='display-1'>Cast your vote here</h1>
        <div className='d-flex flex-row flex-wrap align-items-center justify-content-center'>
          <div className='container d-flex flex-wrap flex-column align-items-center justify-content-center text-wrap'>

            {voterError && (
              <div className="alert alert-danger text-danger text-wrap">{voterError}</div>
            )}
            {voterSuccess && (
              <div className="alert alert-success text-success">{voterSuccess}</div>
            )}
          </div>
          {allCandidates.map((item, index) => {
            return <div className='d-flex flex-column flex-wrap m-2 p-2 align-items-center justify-content-center border border-dark' key={item.id}>
              <h1>{item.name}</h1>
              <h2>{item.party}</h2>
              <h3>{item.constituency}</h3>
              <h4>Candidate ID : {parseInt(item.id)}</h4>
              <h5>Votes : {parseInt(item.votes)}</h5>
              <button className='btn btn-danger' onClick={

                // Cast Vote method 
                async () => {
                  setVoterError("")
                  setVoterSuccess("")
                  try {
                    const votingContractSigner = smartContract.connect(signer)
                    const res = await votingContractSigner.vote(index)
                    setVoterVoteHash(res.hash)
                    setVoterSuccess("Hurray You've casted your Vote")

                  } catch (err) {
                    setVoterError(err.message)
                  }
                }}>Vote</button>
            </div>
          })}
        </div>

        <div className='display-6 m-2'>Current Vote Transaction hash: :
          <br />
          <strong>

            {voterVoteHash}
          </strong>
        </div>
      </section>
    </>
  );
}

export default App;
