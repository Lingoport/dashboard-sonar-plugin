/*
 * Copyright (C) 2011-2019 Lingoport Inc
 * All rights reserved
 * info AT lingoport DOT com
 */
import React from 'react';
import '../style.css';
import {findJenkinsURL} from '../api_lrm.js'
import $ from 'jquery';
import {findWordCost} from '../api_lrm.js'
import {translate} from '../common/l10n.js'
export default class LRMPrepKitContent extends React.PureComponent {
  state = {
    jenkins: '',
    wordcost:'0',
  };

componentDidMount() {
  findJenkinsURL().then(
    (valuesReturnedByAPI) => {
      this.setState({
        jenkins: valuesReturnedByAPI
      });
    }
  );
  findWordCost(this.props.measure.projectKey).then(
    (valuesReturnedByAPI) => {
      this.setState({
        wordcost: valuesReturnedByAPI
      });
    }
  );
}

get(jenkins,e){
  this.disabledButton();
  e.preventDefault();
   $.ajax({
             type:'POST',
             url:jenkins + '/buildByToken/buildWithParameters'+"?" +'job=DashboardPrepKit&token=DASHBOARDPREPKIT&lrm_group_project=' + this.props.measure.project  + '&dashboard_user=' + 'dash',
          //   url:'http://ec2-34-234-66-56.compute-1.amazonaws.com/jenkins'+ '/buildByToken/buildWithParameters'+"?" +'job=DashboardPrepKit&token=DASHBOARDPREPKIT&lrm_group_project=' + 'CET.OpenMind' + '&dashboard_user=' + 'dash',
             contentType:'application/x-www-form-urlencoded; charset=UTF-8',
             beforeSend: function (jqXHR, settings) {
                 var url = settings.url;
              }
           }).done(function(data, textStatus, jqXHR){
              console.log("Prep Kit job queued.")
          }).fail(function(jqXHR, textStatus, errorThrown ) {
           //status is always 0 for cross-domain errors so there will be no information.
           //The No Access-Control-Allow-Origin header is thrown for cross domains even though
           //we're using the build token.
              console.log("Prep Kit job queued if no connection error occurred.")
       });
    }
     disabledButton(){
  		var inputs = document.getElementsByTagName("input");
  		for(var i = 0;i<inputs.length;i++){
  			if(inputs[i].type.toLowerCase()=="submit"){
          inputs[i].value='Your request has been sent';
  				inputs[i].disabled=true;
        }
  		}
  	}
  render() {
    if((this.props.measure.localeMSR === undefined || this.props.measure.localeMSR.length<2)&&(this.props.measure.errorCountMSR===undefined||this.props.measure.errorCountMSR<1)){
      return (
        <div className="block" id="block_6">
        <div className="lplrmprewidget" style={{height:'100%'}}>
        <div className="widget">
        <link href="../style.css" rel="stylesheet"/>
        <h3>{translate('lingoport.nextprepkit')}</h3>
        <div className="lg_widget">
        <table className="lg_ds_progress_bar" border="0" width="500">
        <thead>
        <tr>
            <th>{translate('lingoport.locale')} </th><th># of<br/>{translate('lingoport.files')}</th><th># of<br/>{translate('lingoport.keys')}</th><th># of<br/>{translate('lingoport.words')}</th>
        </tr>
        </thead>
        <tbody>
         <h5>{translate('lingoport.nofiles')}</h5>
        </tbody></table>
        </div>
        <div className="clear"></div>
        </div>
        <div style={{clear: 'both'}}></div>
        </div>
        </div>

      );
    }else{
      var locale = this.props.measure.localeMSR.split(";")
      var numFiles = this.props.measure.numFilesMSR.split(";")
      var numKeys = this.props.measure.numKeysMSR.split(";")
      var numWords = this.props.measure.numWordsMSR.split(";")
      var displayName = this.props.measure.displayNameMSR.split(";")
      var filename = this.props.measure.filesToPrepMSR.split(";")
      var errorCount =   this.props.measure.errorCountMSR
      var content = new Array(locale.length);
      var ftp = '';
      var totalword = 0;
      var totalcost = 0;
      for(let m = 0; m < filename.length; m++){
        ftp = ftp + filename[m] + '\n'
      }
      for(let d = 0; d < locale.length; d++){
         totalword = totalword + Number(numWords[d]);
         content[d]  = (
           <tr height="30" className="alt">
           <td className="label" title={displayName[d]}>{locale[d]}</td>
           <td className="label">{numFiles[d]}</td>
           <td className="label">{numKeys[d]}</td>
           <td className="label">{numWords[d]}</td>
          </tr>
         );
      }
     if(this.state.wordcost!=undefined && Number(this.state.wordcost)>0){
        totalcost = totalword * Number(this.state.wordcost);
     }
     var totaltable = '';
     if(totalcost>0){
        totaltable =(
          <table>
             <tbody><tr>
              <td valign="top" align="left" nowrap="">
                {translate('lingoport.wordcost')}: ${this.state.wordcost}<br/>
                {translate('lingoport.totalcost')}: ${totalcost}<br/>
              </td>
           </tr>
          </tbody></table>
       );
     }
    if(errorCount!='0'){
       var link = '/project/issues?id='+this.props.measure.projectKey+'&resolved=false&severities=CRITICAL&tags=lrm-base&types=BUG'
      // var messa = There is this.props.measure.errorCountMSR
       content = (
         <tr height="30">
         <td className="error_label_href error_hover_href" style={{backgroundColor:'#ff0000',color: '#ffffff'}}><a href ={link}>There are {errorCount} critical errors preventing a translation being sent.</a></td>
         </tr>
      );

    return (
      <div className="block" id="block_6">
      <div className="lplrmprewidget" style={{height:'100%'}}>
      <div className="widget">
      <link href="../style.css" rel="stylesheet"/>
      <h3>{translate('lingoport.nextprepkit')}</h3>
      <div className="lg_widget">
      {totaltable}
      <table className="lg_ds_progress_bar" border="0" width="500">
      <thead>
      <tr>
      <th>{translate('lingoport.locale')} </th><th># of<br/>{translate('lingoport.files')}</th><th># of<br/>{translate('lingoport.keys')}</th><th># of<br/>{translate('lingoport.words')}</th>
      </tr>
      </thead>
      <tbody>
          {content}
      </tbody></table>
      </div>
      <div className="clear"></div>
      </div>
      <div style={{clear: 'both'}}></div>
      </div>
      </div>
    );

  }else{
    return (
      <div className="block" id="block_6">
      <div className="lplrmprewidget" style={{height:'100%'}}>
      <div className="widget">
      <link href="../style.css" rel="stylesheet"/>
      <h3 title={ftp}>{translate('lingoport.nextprepkit')}</h3>
      <div className="lg_widget">
      {totaltable}
      <table className="lg_ds_progress_bar" border="0" width="500">
      <thead>
      <tr>
      <th>{translate('lingoport.locale')} </th><th># of<br/>{translate('lingoport.files')}</th><th># of<br/>{translate('lingoport.keys')}</th><th># of<br/>{translate('lingoport.words')}</th>
      </tr>
      </thead>
      <tbody>
          {content}
      <td valign="top" align="left" nowrap="" colspan="4">
      <div id="prepkit">
      <input type="submit" title="" value={translate('lingoport.prepkit')} onClick={this.get.bind(this,this.state.jenkins)}/>
       <a target="_blank" title="Jenkins URL value in LRM global setting-Click to Verify" href={this.state.jenkins}>     Jenkins URL: {this.state.jenkins}</a>
       </div></td>
      </tbody></table>
      </div>
      <div className="clear"></div>
      </div>
      <div style={{clear: 'both'}}></div>
      </div>
      </div>

    );
  }
}
  }
}
