import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {importEVMToken , importSolToken} from '../../utils/function';
import MaroonSpinner from '../Loader/MaroonSpinner';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';


const Token = ({navigation}) => {
  const {theme} = useContext(ThemeContext);
  const {addToken, selectedNetwork, selectedAccount , Tokens} = useAuth();
  const [selectedNetworkParse, setSelectedNetworkParse] = useState({});
  const [importedToken, setImportedToken] = useState({});
  const [toggle, setToggle] = useState(false);
  const [loader , setLoader] = useState(false)
  const [tokenDetail, setTokenDetail] = useState({
    tokenAddress: '',
    nodeURL: '',
    symbol: '',
    decimal: '',
  });

  const updateTokenValue = (key, value) => {
    setTokenDetail(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const addTokenDetail = (data) => {
    addToken(data);
    navigation.navigate('MainPage')
  };

  const importToken = async (selectedNetwork) => {

    const erc20_Regex_evm = /^(0x)?[A-Fa-f0-9]{40}$/;


    let net = selectedNetworkParse;
    const walletAddress = selectedNetworkParse.type == 'solana' ? selectedAccount.solana.publicKey : selectedAccount.evm.address;
    if (selectedNetworkParse.type == 'solana' ) {
      try{
        setLoader(true)
        let responce = await importSolToken(walletAddress , tokenDetail.tokenAddress );
        if(!responce){
          setLoader(false)
          Dialog.show({
            type: ALERT_TYPE.INFO,
            title: 'Token Not Found',
            textBody: 'Token is not available in your list',
            button: 'close',
          })
        }else{
          setLoader(false)
          console.log(responce.token)
          updateTokenValue('tokenAddress', tokenDetail.tokenAddress)
          updateTokenValue('symbol',responce.token.symbol)
          updateTokenValue('decimal',responce.token.decimals)
          setImportedToken(responce.token)
          setToggle(true)
        }
      }catch(error){
        setLoader(false)
      }
      
      
    } else {
      if(erc20_Regex_evm.test(tokenDetail.tokenAddress)){
        try{
          setLoader(true)
          let responce = await importEVMToken(walletAddress , net?.nodeURL , net?.networkName , tokenDetail.tokenAddress );
          if(!responce){
            setLoader(false)
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Network Error',
              textBody: 'Network is Not ok',
            })
          }else{
            setLoader(false)
            console.log(responce.data)
            updateTokenValue('tokenAddress', tokenDetail.tokenAddress)
            updateTokenValue('symbol',responce.data.symbol)
            updateTokenValue('decimal',responce.data.decimals)
            setImportedToken(responce.data)
            setToggle(true)
          }
        }catch(error){
          setLoader(false)
        }
      }else{
         Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Invalid Address',
              textBody: 'Given Address is not Valid',
            })
      }
    }
  };

  const getSelectedNetork = async () => {
    let date = await JSON.parse(selectedNetwork);
    setSelectedNetworkParse(date);
  };

  useEffect(() => {
    getSelectedNetork();
  }, [selectedNetwork]);


  return (
    <View style={styles.mainWrapper}>
      {loader ? <MaroonSpinner /> : 
      <>
      <View style={styles.inpMainWrapper}>
        <Text style={[styles.inpLabel, {color: theme.text}]}>Address</Text>
        
        <TextInput
        value={tokenDetail?.tokenAddress}
          style={[styles.inpWrapper, {backgroundColor: theme.menuItemBG , paddingVertical:20}]}
          onChangeText={text => updateTokenValue('tokenAddress', text)}
        />
      </View>
      <View style={styles.inpMainWrapper}>
        <Text style={[styles.inpLabel, {color: theme.text}]}>Symbol</Text>
        <View
          style={[
            styles.inpWrapper,
            {backgroundColor: theme.menuItemBG, paddingVertical: 25},
          ]}>
            <Text>{tokenDetail?.symbol}</Text>
          </View>
      </View>
      <View style={styles.inpMainWrapper}>
        <Text style={[styles.inpLabel, {color: theme.text}]}>Decimals</Text>
        <View
          style={[
            styles.inpWrapper,
            {backgroundColor: theme.menuItemBG, paddingVertical: 25},
          ]}>
            <Text>{tokenDetail?.decimal}</Text>
          </View>
      </View>
      <View style={styles.tokenImportBtnWrapper}>
        <TouchableOpacity
          onPress={() =>
            !toggle ? importToken(selectedNetworkParse) : addTokenDetail(importedToken)
          }
          style={[styles.tokenImportButton, {borderColor: theme.buttonBorder}]}>
          <Text style={[styles.tokenImportButtonText, {color: theme.text}]}>
            {!toggle ? 'Import' : 'Add Token'}
          </Text>
        </TouchableOpacity>
      </View>
      </>
      }
    </View>
  );
};

export default Token;

const styles = StyleSheet.create({
  mainWrapper: {
    marginTop: 40,
    marginBottom: 40,
  },
  inpMainWrapper: {
    marginBottom: 15,
  },
  inpLabel: {
    // color: "#FFF",
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '700',
    textTransform: 'capitalize',
    marginLeft: 5,
  },
  inpWrapper: {
    color: 'white',
    marginTop: 10,
    padding: 12,
    paddingLeft: 18,
    // backgroundColor: "#362538",
    borderRadius: 8,
  },
  tokenImportBtnWrapper: {
    marginTop: 25,
  },
  tokenImportButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    // borderColor: "#FF003C",
    borderWidth: 1,
    borderRadius: 100,
  },
  tokenImportButtonText: {
    // color: "#FFF",
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '600',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});
