var AWS = require('aws-sdk');
const helpers = require('./helpers')
AWS.config.update({region:'us-east-1'});

const ec2 = new AWS.EC2();
const KeyName = 'SDK1stKey';
const SGName = 'SG-with-SDK-1'

// Do all the the thing together
createSG(SGName)
.then(()=>{ return createKP(KeyName)})
.then(()=>{ helpers.persistKeyPair })
.then(()=>{ return createInstance(SGName,KeyName)})
.then((data)=>{ console.log('Instance Create Successfuly '+data)})
.catch((e)=>{ console.log('Something Faild !! '+e)})

// Security Group Function 
function createSG(SGName){
    console.log('SG Creating ...')
    let params = {
        GroupName: SGName,
        Description: 'This is my First SG Using AWS-SDK'
    }

    return new Promise((resolve, reject)=>{
        ec2.createSecurityGroup(params, (err, data)=>{
            if(err)
                console.log(err);
            else{
                const params = {
                    GroupId: data.GroupId,
                    IpPermissions: [
                        {
                            IpProtocol: 'tcp',
                            FromPort: 22,
                            ToPort: 22,
                            IpRanges: [
                                {CidrIp: '0.0.0.0/0'}
                            ]
                        },
                        {
                            IpProtocol: 'tcp',
                            FromPort: 3000,
                            ToPort: 3000,
                            IpRanges:[
                                {CidrIp: '0.0.0.0/0'}
                            ]
                        }
                    ]
                }
                ec2.authorizeSecurityGroupIngress(params, err=>{
                    if(err)
                        reject(err)
                    else
                        resolve()
                })
            }
        })
    });
}

// Creating KeyPair 
function createKP(KeyName){

    console.log('KP Creating ...')
    let params={
        KeyName: KeyName 
    }

    return new Promise((resolve, reject)=>{
        ec2.createKeyPair(params, (err, data)=>{
            if(err)
                reject(err)
            else
                resolve(data)
        })
    })

}

// Create EC2 Instance
function createInstance(){
    console.log('EC2 Creating ...')
    const params = {
        ImageId: 'ami-09e67e426f25ce0d7',
        //InstanceType: 't2.mirco',
        KeyName: KeyName,
        MaxCount: 1,
        MinCount: 1,
        SecurityGroups: [SGName],
        UserData: 'IyEvYmluL2Jhc2gKc3VkbyBhcHQtZ2V0IHVwZGF0ZQpzdWRvIGFwdC1nZXQgLXkgaW5zdGFsbCBnaXQKZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2xhbWJhYmEvU3BhY2VYIC9ob21lL0Rlc2t0b3AvYmFiYQpjZCAvaG9tZS9EZXNrdG9wL2JhYmEKc3VkbyBucG0gaQpzdWRvIG5wbSBydW4gc3RhcnQ=',
    }

    return new Promise((resolve, reject)=>{
        
        ec2.runInstances(params, (err, data)=>{
            if(err)
                reject(err)
            else
                resolve(data)
        })

    })

}