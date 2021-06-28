import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DropzoneComponent, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ToastrService } from 'ngx-toastr';
import { Dashboard, DashboardLaneDocumentClass, Lane } from '../../entity/lane';
import { UploadService } from '../../service/upload.service';
import { UploadFile } from '../../entity/upload/uploadFile';
import { UploadCompleteRequest } from '../../entity/upload/uploadCompleteRequest';
import { DataInfo } from '../../entity/upload/dataInfo';
import { DataInfoFile } from '../../entity/upload/dataInfoFile';
import { ReservedLaneNames } from '../../entity/reservedLaneNames';

@Component({
    selector: 'app-dashboard-lane-card',
    templateUrl: './dashboard-lane-card.component.html',
    // styleUrls: ['./dashboard-lane-card.component.scss']
})
export class DashboardLaneCardComponent implements OnInit {

    public dropzoneConfig: DropzoneConfigInterface;
    public totalFilesUploaded = 0;
    public uploadedFilesAsPercentage = 0;
    public isUploadingFiles = false;
    public filesToUpload: File[] = [];
    public dashboardLaneDocumentClass: DashboardLaneDocumentClass;
    public reservedLanes = new ReservedLaneNames().ReservedLaneNames;

    @Input() public dashboard: Dashboard;
    @Input() public showLaneView?: boolean;

    @ViewChild('dz') dropzone: DropzoneComponent;
    @ViewChild('addDocumentsToLane') modalContent: TemplateRef<any>;

    constructor(
        private translateService: TranslateService,
        private toastr: ToastrService,
        private modalService: NgbModal,
        private uploadService: UploadService,
    ) { }

    public ngOnInit(): void {

        this.dropzoneConfig = {
            uploadMultiple: true,
            autoProcessQueue: false,
            autoQueue: false,
            url: '/',
            acceptedFiles: '.pdf',
            addRemoveLinks: true,
            clickable: true,
            previewTemplate:
                `<div class="row bg-white border-overlay my-1 mx-2">
                    <div class="col d-flex flex-row align-self-center">
                      <div class="pr-4 align-self-center"><span data-dz-name></span></div>
                      <div class="align-self-center" data-dz-size></div>
                      <div class="align-self-center"><span class="dz-upload" data-dz-uploadprogress></span></div>
                      <div class="align-self-center"><span data-dz-errormessage></span></div>
                    </div>
                </div>`,
            dictRemoveFile:
                `<div class="col">
                  <button class="btn icon-btn md-btn-flat btn-danger remove-added-file">
                      <i class="fas fa-trash"></i>
                  </button>
                </div>`
        };
    }

    public filterLanesByClassName(className: string, dashobard: Dashboard) {
        return dashobard.lanes.filter(lane => lane.className === className);
    }

    public getDoubleCheckLane(lane: Lane) {
        return this.dashboard.lanes.find(l => l.name === lane.name + '_doubleCheck');
    }

    public isLaneReserved(laneName: string) {
        return this.reservedLanes.includes(laneName);
    }

    public openModal(lane :DashboardLaneDocumentClass): void {
        this.dashboardLaneDocumentClass = lane;
        this.modalService.open(this.modalContent, { centered: true });
    }

    public closeModal(): void {
        this.modalService.dismissAll();
        this.resetUploadFilesData();
    }

    public onAddedFile(file: File): void {
        this.uploadedFilesAsPercentage = 0;
        if (file.type.includes("pdf")) {
            this.filesToUpload.push(file);
        }
    }

    public onRemoveFile(event): void {
        const removeFile = this.filesToUpload.find(item => (item as any).upload.uuid == event.upload.uuid);
        const removeFileIndex = this.filesToUpload.indexOf(removeFile);
        this.filesToUpload.splice(removeFileIndex, 1);
    }

    public onUploadError(event) {

        if (event && event[1] === `You can't upload files of this type.`) {

            // Using a native JS approach instead of @ViewChild due to the dropzone 
            // being embedded in a modal and thus inaccessible to @ViewChild
            
            const dropzone = (document.querySelector('.modal-dialog .dropzone') as any);
            dropzone.querySelector('.remove-added-file').click();
            dropzone.style.pointerEvents = 'auto';

            this.translateService.get('dropzone.dictOnlyPdfTypeAllowedError').subscribe(translate => {
                this.toastr.error(translate);
            });
        }
    }

    public uploadFilesToLane(): void {
        this.isUploadingFiles = true;
        for(let i = 0; i < this.filesToUpload.length; i++){
            this.addFile(this.filesToUpload[i]);
        }
    }

    public addFile(file: File): void {
        const reader = new FileReader();
        var chunkIds: Array<string> = [];

        //chunkSize must be divisible by 4 in order to base64 string to be properly processed.
        const chunkSize = 943720;

        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result.toString();
            const stream = base64.substring(base64.indexOf(',') + 1, base64.length);

            const numChunks = Math.ceil(base64.length / chunkSize);
            const chunks = new Array(numChunks);

            let chunkUploadRequests = [];

            for (let i = 0, buffer = 0; i < numChunks; ++i, buffer += chunkSize) {

                chunks[i] = stream.substr(buffer, chunkSize)

                const exampleFile: UploadFile = new UploadFile();
                exampleFile.name = file.name;
                exampleFile.type = file.type;
                exampleFile.stream = chunks[i];

                chunkUploadRequests.push(this.uploadService.upload(exampleFile).toPromise());
            }

            Promise.all(chunkUploadRequests).then( results => {
                results.map(result => chunkIds.push(result.toString()));

                if (chunkIds.length) {
                    this.mergeChunks(chunkIds, file.name);
                }
            }).catch( error =>
                {
                    this.translateService.get('dropzone.dictResponseError').subscribe(translate => {
                        this.toastr.warning(translate);
                    });
                    this.isUploadingFiles = false;
                }
            );
        };
    }

    public getRoute(dashboardLane : Lane) {
        if (dashboardLane.name == 'Recycle Bin') {
            return ['/document', 'recycle-bin'];
        } else {
            return ['/lanes', dashboardLane.id, dashboardLane.name, 'overview'];
        }
    }

    private mergeChunks(chunks: string[], fileName: string): void {
        let request = new UploadCompleteRequest();
        request.chunkIds = chunks;
        
        this.uploadService.mergeChunks(request)
            .subscribe((result: any) => {
                this.trackUploadedFilesAmount(1);
                this.removeUploadedFile(fileName);
                this.calculateUploadProgress();
                this.completeUpload(result[0], fileName);
                
                if (this.filesToUpload.length == 0) {
                    this.resetUploadFilesData(false);
                }
            }, err => {
                console.error(err);
            });
    }

    private completeUpload(fileId: string, fileName: string): void {

        const dataInfoFile = new DataInfoFile();
        dataInfoFile.fileId = fileId;
        dataInfoFile.fileName = fileName;

        const dataInfo = new DataInfo();
        dataInfo.origin = "cloud";
        dataInfo.files.push(dataInfoFile);

        this.uploadService.completeUpload(dataInfo, this.dashboardLaneDocumentClass.name)
            .subscribe((result: any) => {
            }, err => {
                console.error(err);
            });
    }

    private trackUploadedFilesAmount(index: number): void {
        this.totalFilesUploaded += index;
    }

    private resetUploadFilesData(fullReset: boolean = true): void{
        this.filesToUpload = [];
        this.totalFilesUploaded = 0;
        this.isUploadingFiles = false;
        if(fullReset){
            this.uploadedFilesAsPercentage = 0;
        }
    }

    private calculateUploadProgress(): void {
        this.uploadedFilesAsPercentage = Math.round((this.totalFilesUploaded)*100/this.filesToUpload.length);
    }

    private removeUploadedFile(fileName: string){
        const fileList = Array.from(document.querySelectorAll('.dropzone .row span[data-dz-name]'));
        const fileToBeDeleted = fileList.find(element => element.innerHTML == fileName);

        if (fileToBeDeleted) {
            const parentElement = fileToBeDeleted.closest('.dropzone .row');
    
            (parentElement.querySelector('.dz-remove') as HTMLElement).click();
        }
    }
}