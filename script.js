var gltfModel;
AFRAME.registerSystem("hit-test-system", {
  schema: {
    reticle: { type: "selector" }
  },
  init: function () {
    this.reticle = this.data.reticle;

    this.el.addEventListener("enter-vr", () => {
      this.reticle.setAttribute("visible", "false");

      this.session = this.el.sceneEl.renderer.xr.getSession();
      this.el.sceneEl.renderer.xr.addEventListener(
        "sessionstart",
        async (ev) => {
          this.viewerSpace = await this.session.requestReferenceSpace("viewer");
          this.refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
          this.xrHitTestSource = await this.session.requestHitTestSource({
            space: this.viewerSpace
          });
        }
      );

      this.session.addEventListener("select", (e) => {
        //if (!this.reticle.getAttribute("visible")) return;

        /*
          <a-entity>
          < a-gltf-model scale="0.2 0.2 0.2" src="#bulbasaur"></a-gltf-model>
          </a-entity>
        */
        //Array con todos los src de los assets
        const srcA = this.el.sceneEl.querySelectorAll("[src]");
        const entity = document.createElement("a-entity");
        gltfModel = document.createElement("a-gltf-model");

        gltfModel.setAttribute("scale", "0.2 0.2 0.2");
        gltfModel.setAttribute("src", srcA[indice].getAttribute("src"));

        entity.appendChild(gltfModel);

        gltfModel.setAttribute(
          "position",
          this.reticle.getAttribute("position")
        );

        this.el.sceneEl.appendChild(entity);
      });
    });
  },

  tick: function () {
    this.reticle.setAttribute("visible", "false");
    const frame = this.el.sceneEl.frame;
    if (!frame) return;

    const viewerPose = this.el.sceneEl.renderer.xr.getCameraPose();
    if (this.xrHitTestSource && viewerPose) {
      const hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
      if (hitTestResults.length > 0) {
        const hitTestPose = hitTestResults[0].getPose(this.refSpace);
        ["x", "y", "z"].forEach((axis) => {
          this.reticle.object3D.position[axis] =
            hitTestPose.transform.position[axis];
        });
        this.reticle.object3D.quaternion.copy(
          hitTestPose.transform.orientation
        );
        this.reticle.setAttribute("visible", "true");
      }
    }
  }
});

var indice = 0;
//Lógica del bótón
AFRAME.registerComponent("dom-overlays-system", {
  schema: {},
  init: function () {
    this.el.sceneEl.addEventListener("enter-vr", (e) => {
      if (!this.el.sceneEl.is("ar-mode")) return;

      const button = document.querySelector("#btn-change-color");
      //Array con todos los src de los assets
      const srcA = this.el.sceneEl.querySelectorAll("[src]");
      /*
       * Forma genérica para pasar al siguiente modelo con cada "click"
       * Volviendo al inicial cuando se llega al último
       */
      button.addEventListener("click", function () {
        if (indice < srcA.length - 1) {
          indice = indice + 1;
        } else {
          indice = 0;
        }
      });

      button.addEventListener("beforexrselect", (e) => {
        e.preventDefault();
      });
    });
  },

  tick: function () {}
});
